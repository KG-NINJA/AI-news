import fs from "fs"

async function run(){

  const API_KEY = process.env.GEMINI_API_KEY

  const data = JSON.parse(
    fs.readFileSync("news/raw/latest.json","utf8")
  )

  const ai = data
    .filter(i=>i.category==="AI")
    .slice(0,3)

  const world = data
    .filter(i=>i.category==="WORLD")
    .slice(0,2)

  const aiText = ai.map(i=>`- ${i.title}`).join("\n")
  const worldText = world.map(i=>`- ${i.title}`).join("\n")

  const prompt = `
以下は最新の海外ニュースです。

## AI関連
${aiText}

## 世界情勢
${worldText}

日本語でニュース記事として再構成してください。

単なる要約ではなく、
背景・影響・今後の可能性を含めてください。

セクション分け：
# AIニュース考察
# 世界情勢ニュース考察
`

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+API_KEY,
    {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        contents:[{parts:[{text:prompt}]}]
      })
    }
  )

  const json = await res.json()

  if(!json.candidates){
    console.log("Gemini error")
    process.exit(0)
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
  <body style="font-family:system-ui;max-width:800px;margin:40px auto;">
  <h1>AI + 世界情勢 自動考察ニュース</h1>
  ${text.replace(/\n/g,"<br>")}
  </body>
  </html>
  `)

  console.log("Article created:",filename)
}

run()
