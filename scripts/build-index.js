import fs from "fs"

const docsDir = "docs"

// RSS一覧
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

// 最新考察1件だけ表示（短め前提）
let latestArticleHtml = ""
const files = fs.readdirSync(docsDir)
  .filter(f => f.startsWith("article-") && f.endsWith(".html"))
  .sort()
  .reverse()

if(files.length > 0){
  const latest = fs.readFileSync(docsDir+"/"+files[0],"utf8")

  // body内だけ抽出
  const match = latest.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  latestArticleHtml = match ? match[1] : ""
}

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI + 世界情勢ニュース</title>
<style>
body{
  font-family: system-ui;
  max-width: 900px;
  margin: 40px auto;
  line-height: 1.8;
}
h1{
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}
ul{
  list-style:none;
  padding:0;
}
li{
  margin-bottom:10px;
}
a{
  text-decoration:none;
  color:#0066cc;
}
a:hover{
  text-decoration:underline;
}
.section{
  margin-top:40px;
  padding:20px;
  background:#f8f8f8;
  border-radius:8px;
}
</style>
</head>
<body>

<h1>AI + 世界情勢ニュース</h1>

<h2>最新RSS速報</h2>
<ul>
${listRss}
</ul>

<h2>最新考察（自動生成）</h2>
<div class="section">
${latestArticleHtml}
</div>

</body>
</html>
`

fs.writeFileSync("docs/index.html", html)
console.log("Index rebuilt (RSS + Short Insight)")
