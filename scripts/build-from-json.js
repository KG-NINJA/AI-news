import fs from "fs"

const data = JSON.parse(
  fs.readFileSync("news/raw/latest.json","utf8")
)

let list = ""

data.forEach(item => {

  list += `
    <li>
      <span style="font-weight:bold;color:${item.category==="AI"?"#0077cc":"#cc3300"}">
        [${item.category}]
      </span>
      <a href="${item.link}" target="_blank">
        ${item.title}
      </a>
    </li>
  `
})

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI + World News Feed</title>
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
  list-style: none;
  padding: 0;
}
li{
  margin-bottom: 14px;
}
a{
  text-decoration: none;
  color: #0066cc;
}
a:hover{
  text-decoration: underline;
}
</style>
</head>
<body>

<h1>AI + 世界情勢ニュース（RSS一覧）</h1>

<ul>
${list}
</ul>

</body>
</html>
`

fs.mkdirSync("docs",{recursive:true})
fs.writeFileSync("docs/index.html", html)

console.log("HTML generated from latest.json")
