import fs from "fs"

const docsDir = "docs"

// ✨ RSS 一覧用（latest.json） 
let listRss = ""
const rawData = JSON.parse(
  fs.readFileSync("news/raw/latest.json","utf8")
)

rawData.forEach(item => {
  listRss += `
    <li>
      <span style="font-weight:bold;color:${item.category==="AI"?"#0077cc":"#cc3300"}">
        [${item.category}]
      </span>
      <a href="${item.link}" target="_blank">${item.title}</a>
    </li>
  `
})

// ✨ 考察記事一覧用（article-*.html）
let listArticles = ""
fs.readdirSync(docsDir)
  .filter(f => f.startsWith("article-") && f.endsWith(".html"))
  .sort()
  .reverse()
  .forEach(file => {
    listArticles += `
      <li><a href="${file}">${file}</a></li>
    `
  })

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI + 世界情勢ニュース</title>
<style>
body{font-family:system-ui;max-width:900px;margin:40px auto;line-height:1.8}
h1{border-bottom:2px solid #ddd;padding-bottom:10px}
ul{list-style:none;padding:0}
li{margin-bottom:12px}
a{text-decoration:none;color:#0066cc}
a:hover{text-decoration:underline}
</style>
</head>
<body>

<h1>AI + 世界情勢ニュース（自動更新）</h1>

<h2>最新 RSS 一覧</h2>
<ul>
${listRss}
</ul>

<h2>考察された記事</h2>
<ul>
${listArticles}
</ul>

</body>
</html>
`

fs.writeFileSync("docs/index.html",html)

console.log("Index rebuilt")
