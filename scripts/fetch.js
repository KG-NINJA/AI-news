import fs from "fs"
import Parser from "rss-parser"

const parser = new Parser()

// 安定サイトだけ
const feeds = [
  "https://venturebeat.com/category/ai/feed/",
  "https://www.technologyreview.com/feed/"
]

// 5秒タイムアウト付きfetch
async function fetchWithTimeout(url, timeout = 5000) {

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

async function run() {

  let allItems = []

  for (const url of feeds) {

    console.log("Checking:", url)

    try {

      const res = await fetchWithTimeout(url)
      const xml = await res.text()
      const feed = await parser.parseString(xml)

      const items = feed.items.slice(0, 3) // 最新3件だけ

      for (const item of items) {
        allItems.push({
          title: item.title,
          link: item.link
        })
      }

    } catch (e) {

      console.log("RSS failed:", url)
      console.log("Reason:", e.message)

      continue // 失敗しても次へ

    }
  }

  console.log("Total items:", allItems.length)

  // ディレクトリ確保
  fs.mkdirSync("news/raw", { recursive: true })

  const text = allItems.map(i =>
    `${i.title}\n${i.link}\n`
  ).join("\n")

  fs.writeFileSync("news/raw/latest.txt", text)

  console.log("latest.txt written")

  process.exit(0) // 絶対成功扱い
}

run()
