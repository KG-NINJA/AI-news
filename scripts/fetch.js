const Parser = require("rss-parser")
const fs = require("fs")

const parser = new Parser()

async function run(){

const sources = fs.readFileSync(
"sources/rss.txt",
"utf8"
)
.split("\n")
.filter(x=>x.trim().length>0)

let processed=[]

if(fs.existsSync("state/processed.json")){
 processed=JSON.parse(
 fs.readFileSync("state/processed.json")
 )
}

let newItems=[]

for(const url of sources){

console.log("Checking:",url)

try{

const feed=await parser.parseURL(url)

feed.items.forEach(item=>{

if(item.link && !processed.includes(item.link)){
 newItems.push(item)
}

})

}catch(e){

console.log("RSS failed:",url)

continue

}

}

if(newItems.length===0){

console.log("No new items")

process.exit(0)

}

let output=""

newItems.slice(0,10).forEach(item=>{

output+=`
TITLE:
${item.title}

LINK:
${item.link}

SUMMARY:
${item.contentSnippet}

-----

`

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

console.log("New items:",newItems.length)

}

run()
