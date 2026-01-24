import feedparser
import datetime
import os

# Set timezone for Japan (UTC+9) manually to avoid external heavy deps if possible,
# or just use datetime with timezone info.
# Since we are in a container, system time might be UTC.
def get_jst_time():
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    jst_tz = datetime.timezone(datetime.timedelta(hours=9))
    return utc_now.astimezone(jst_tz)

def fetch_ai_news():
    # Google News RSS URL for "AI" (Artificial Intelligence) in Japanese
    rss_url = "https://news.google.com/rss/search?q=AI+Artificial+Intelligence&hl=ja&gl=JP&ceid=JP:ja"

    feed = feedparser.parse(rss_url)
    return feed.entries

def generate_html(entries):
    jst_now = get_jst_time()
    date_str = jst_now.strftime("%Y年%m月%d日 %H:%M")

    html_content = f"""
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI News Headlines</title>
    <style>
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f9;
            color: #333;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            text-align: center;
            color: #2c3e50;
        }}
        .update-time {{
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            margin-bottom: 30px;
        }}
        .news-item {{
            border-bottom: 1px solid #eee;
            padding: 15px 0;
        }}
        .news-item:last-child {{
            border-bottom: none;
        }}
        .news-title {{
            font-size: 1.1em;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        .news-title a {{
            text-decoration: none;
            color: #2980b9;
        }}
        .news-title a:hover {{
            text-decoration: underline;
        }}
        .news-meta {{
            font-size: 0.85em;
            color: #95a5a6;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>AI関連ニュース (AI News Headlines)</h1>
        <div class="update-time">更新日時: {date_str} (JST)</div>
        <div class="news-list">
    """

    for entry in entries:
        # Some feeds might not have published_parsed
        published = "日時不明"
        if hasattr(entry, 'published'):
            published = entry.published

        html_content += f"""
            <div class="news-item">
                <div class="news-title">
                    <a href="{entry.link}" target="_blank" rel="noopener noreferrer">{entry.title}</a>
                </div>
                <div class="news-meta">{published}</div>
            </div>
        """

    html_content += """
        </div>
    </div>
</body>
</html>
    """

    return html_content

def main():
    print("Fetching news...")
    entries = fetch_ai_news()
    print(f"Found {len(entries)} articles.")

    html = generate_html(entries)

    output_path = "index.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Successfully generated {output_path}")

if __name__ == "__main__":
    main()
