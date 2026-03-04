fs.writeFileSync(filename,`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI + 世界情勢ニュース</title>

<style>

body{
  margin:0;
  font-family: system-ui;
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

header h1{
  margin:0;
  font-size:32px;
}

.meta{
  color:#777;
  font-size:14px;
  margin-top:6px;
}

.article{
  background:white;
  padding:30px;
  border-radius:10px;
  box-shadow:0 3px 12px rgba(0,0,0,0.08);
  line-height:1.8;
  font-size:17px;
}

.article h1{
  margin-top:0;
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
<div class="meta">
自動生成ニュース | ${new Date().toLocaleString()}
</div>
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
