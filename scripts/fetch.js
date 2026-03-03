import Parser from "rss-parser"
import fs from "fs"

// RSSパーサー（タイムアウト付き）
const parser = new Parser({
  timeout: 5000,
  requestOptions: {
    timeout: 5000
  }
})

// 取得対象フィード
const feeds = [
  { url: "https://venturebeat.com/category/ai/feed/", category: "AI" },
  { url: "https://www.technologyreview.com/feed/", category: "AI" },
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", category: "WORLD" }
]

// タイムアウト付き安全取得
async function safeParse(feed) {
  try {
    console.log("Checking:", feed.url)

    const result = await Promise.race([
      parser.parseURL(feed.url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 6000)
      )
    ])

    return result
  } catch (err) {
    console.log("RSS failed:", feed.url)
    return null
  }
}

async function run() {
  try {
    let items = []

    for (const feed of feeds) {
      const data = await safeParse(feed)
      if (!data) continue

      data.items.slice(0, 3).forEach(item => {
        if (!item.title || !item.link) return

        items.push({
          category: feed.category,
          title: item.title,
          link: item.link
        })
      })
    }

    // 保存ディレクトリ作成
    fs.mkdirSync("news/raw", { recursive: true })

    // 保存
    fs.writeFileSync(
      "news/raw/latest.json",
      JSON.stringify(items, null, 2)
    )

    console.log("Combined RSS written:", items.length)

  } catch (e) {
    console.log("Fetch error:", e.message)
  }
}

// 👇 重要：必ずプロセスを終了させる
run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log("Fatal error:", e.message)
    process.exit(1)
  })
