const Parser = require("rss-parser")
const fs = require("fs")

const parser = new Parser()

async function run(){

const sources = fs.readFileSync(
"sources/rss.txt",
"utf8"
).split("\n").filter(x=>x)

let processed=[]

if(fs.existsSync("state/processed.json")){
 processed=JSON.parse(
 fs.readFileSync("state/processed.json")
 )
}

let newItems=[]

for(const url of sources){

try{
const feed=await parser.parseURL(url)

feed.items.forEach(item=>{

if(!processed.includes(item.link)){

newItems.push(item)

}

})
}catch(_error){
 console.log(`RSS failed: ${url}`)
}

}

if(newItems.length===0){

if(fs.existsSync("news/raw/latest.txt")){
 fs.unlinkSync("news/raw/latest.txt")
}

console.log("No new items")
process.exit(0)

}

let output=""

newItems.slice(0,10).forEach(item=>{

output+=`\nTITLE:\n${item.title}\n\nLINK:\n${item.link}\n\nSUMMARY:\n${item.contentSnippet}\n\n-----\n\n`

processed.push(item.link)

})

fs.writeFileSync(
"news/raw/latest.txt",
output
)

fs.writeFileSync(
"state/processed.json",
JSON.stringify(processed,null,2)
)

}

run()
