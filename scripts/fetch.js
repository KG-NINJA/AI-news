import fs from "fs"
import Parser from "rss-parser"

const parser = new Parser()

const sources = {
  AI: [
    "https://venturebeat.com/category/ai/feed/",
    "https://www.technologyreview.com/feed/"
  ],
  WORLD: [
    "http://feeds.bbci.co.uk/news/world/rss.xml"
  ]
}

async function run(){

  let all = []

  for(const category in sources){

    for(const url of sources[category]){

      try{

        console.log("Checking:",url)

        const feed = await parser.parseURL(url)

        const items = feed.items.slice(0,3)

        items.forEach(item=>{
          all.push({
            category,
            title:item.title,
            link:item.link
          })
        })

      }catch(e){
        console.log("RSS failed:",url)
      }
    }
  }

  fs.mkdirSync("news/raw",{recursive:true})
  fs.writeFileSync(
    "news/raw/latest.json",
    JSON.stringify(all,null,2)
  )

  console.log("Combined RSS written:",all.length)
}

run()
