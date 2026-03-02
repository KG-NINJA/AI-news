const fs = require("fs")

const raw=fs.readFileSync(
"news/raw/latest.txt",
"utf8"
)

const API_KEY=process.env.GEMINI_API_KEY

const prompt=`

以下は海外AIニュースです。

日本語で考察記事を書いてください。

要約は禁止。

解釈と仮説を必ず含めてください。

構成:

タイトル

重要な流れ

解釈

仮説

未来予測

ニュース:

${raw}

`

async function run() {
if(!fs.existsSync("docs")){
 fs.mkdirSync("docs", { recursive: true })
}

const res=await fetch(

"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+API_KEY,

{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

contents:[
{
parts:[
{ text: prompt }
]
}
]

})

}

)

const data=await res.json()

const text=data.candidates[0].content.parts[0].text

const filename="docs/gemini-"+Date.now()+".md"

fs.writeFileSync(
filename,
text
)
}

run()
