import fs from "fs"

async function fetchWithTimeout(url, options, timeout = 15000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ])
}

async function run(){

  try {

    const API_KEY = process.env.GEMINI_API_KEY

    if(!API_KEY){
      console.log("No API key")
      return
    }

    const data = JSON.parse(
      await fs.promises.readFile("news/raw/latest.json","utf8")
    )

    const ai = data.filter(i=>i.category==="AI").slice(0,3)
    const world = data.filter(i=>i.category==="WORLD").slice(0,2)

    const aiText = ai.map(i=>`- ${i.title}`).join("\n")
    const worldText = world.map(i=>`- ${i.title}`).join("\n")

    const prompt = `
以下は最新の海外ニュースです。

## AI関連
${aiText}

## 世界情勢
${worldText}

日本語で簡潔な考察記事を書いてください。

・各セクション300〜500文字程度
・背景と今後のポイントだけ

構成：
# AIニュースまとめ
# 世界情勢まとめ
`

    const res = await fetchWithTimeout(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key="+API_KEY,
      {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          contents:[{parts:[{text:prompt}]}]
        })
      },
      20000
    )

    if(!res.ok){
      console.log("Gemini HTTP error:", res.status)
      return
    }

    const json = await res.json()

    if(!json.candidates){
      console.log("Gemini error")
      return
    }

    const text = json.candidates[0].content.parts[0].text

    await fs.promises.mkdir("docs",{recursive:true})

    const filename = "docs/article-"+Date.now()+".html"

    await fs.promises.writeFile(filename,`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI + 世界情勢ニュース</title>

<style>
body{
  margin:0;
  font-family:system-ui;
  background:#f4f6f8;
}

.container{
  max-width:900px;
  margin:auto;
  padding:40px 20px;
}

header{
  border-bottom:2px solid #ddd;
  margin-bottom:30px;
}

.article{
  background:white;
  padding:30px;
  border-radius:10px;
  box-shadow:0 3px 12px rgba(0,0,0,0.08);
  line-height:1.8;
}

footer{
  margin-top:40px;
  font-size:13px;
  color:#888;
}
</style>

</head>

<body>

<div class="container">

<header>
<h1>AI + 世界情勢ニュース</h1>
</header>

<div class="article">
${text.replace(/\n/g,"<br>")}
</div>

<footer>
AI News Auto System
</footer>

</div>

</body>
</html>
`)

    console.log("Article created:",filename)

  } catch(e){

    console.log("Generate error:", e.message)

  }

}

run()
