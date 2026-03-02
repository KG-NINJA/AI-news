import fs from "fs"

async function run(){

try{

const raw=fs.readFileSync(
"news/raw/latest.txt",
"utf8"
)

// 長さ制限
const shortRaw=raw.slice(0,6000)

const API_KEY=process.env.GEMINI_API_KEY

if(!API_KEY){

console.log("No API key")

process.exit(0)

}

const prompt=`

海外AIニュースの流れを分析してください。

要約ではなく考察を書いてください。

${shortRaw}

`

const response = await fetch(

"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+API_KEY,

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

const textResponse=await response.text()

if(!textResponse){

console.log("Empty response")

process.exit(0)

}

const data=JSON.parse(textResponse)

if(!data.candidates){

console.log("Gemini error")

process.exit(0)

}

const text=data.candidates[0].content.parts[0].text

const filename="docs/gemini-"+Date.now()+".md"

fs.writeFileSync(
filename,
text
)

console.log("Article created:",filename)

}catch(e){

console.log("Generate failed but continuing")

console.log(e)

process.exit(0)

}

}

run()
