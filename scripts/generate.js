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
      fs.readFileSync("news/raw/latest.json","utf8")
    )

    const ai = data.filter(i=>i.category==="AI").slice(0,3)
    const world = data.filter(i=>i.category==="WORLD").slice(0,2)

    if(ai.length===0 && world.length===0){
      console.log("No content to generate")
      return
    }

    const aiText = ai.map(i=>`- ${i.title}`).join("\n")
    const worldText = world.map(i=>`- ${i.title}`).join("\n")

    const prompt = const prompt = `
以下は最新の海外ニュースです。

## AI関連
${aiText}

## 世界情勢
${worldText}

日本語で簡潔な考察記事を書いてください。

・各セクション300〜500文字程度
・冗長な説明は禁止
・背景と今後のポイントだけ
・メディア風に自然な文章で

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
      console.log("Gemini API returned no candidates")
      console.log(JSON.stringify(json))
      return
    }

    const text = json.candidates[0].content.parts[0].text

    fs.mkdirSync("docs",{recursive:true})

    const filename = "docs/article-"+Date.now()+".html"

    fs.writeFileSync(filename,`
<html>
<head>
<meta charset="UTF-8">
<title>AI + World News</title>
</head>
<body style="font-family:system-ui;max-width:800px;margin:40px auto;line-height:1.7">
<h1>AI + 世界情勢 自動考察ニュース</h1>
${text.replace(/\n/g,"<br>")}
</body>
</html>
`)

    console.log("Article created:",filename)

  } catch(e){
    console.log("Generate error:", e.message)
  }
}

run()
