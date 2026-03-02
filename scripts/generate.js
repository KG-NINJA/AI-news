import fs from "fs"

async function run(){

const raw=fs.readFileSync(
"news/raw/latest.txt",
"utf8"
)

const API_KEY=process.env.GEMINI_API_KEY

if(!API_KEY){

console.log("No GEMINI_API_KEY")

process.exit(1)

}

const prompt=`

以下は海外AIニュースです。

日本語で考察記事を書いてください。

要約は禁止。

解釈と仮説を含めてください。

ニュース:

${raw}

`

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

console.log("Gemini response:")
console.log(JSON.stringify(data,null,2))

if(!data.candidates){

console.log("Gemini error")

process.exit(1)

}

const text=data.candidates[0].content.parts[0].text

const filename="docs/gemini-"+Date.now()+".md"

fs.writeFileSync(
filename,
text
)

console.log("Article created:",filename)

}

run()
