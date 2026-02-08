import feedparser
import datetime
import os
import logging

def get_jst_time():
    """Returns the current time in JST."""
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    jst_tz = datetime.timezone(datetime.timedelta(hours=9))
    return utc_now.astimezone(jst_tz)

def fetch_ai_news():
    # Google News RSS URL for "AI" (Artificial Intelligence) in Japanese
    # Added when:1d to get recent news.
    rss_url = "https://news.google.com/rss/search?q=AI+Artificial+Intelligence+when:1d&hl=ja&gl=JP&ceid=JP:ja"

    feed = feedparser.parse(rss_url)

    # Filter entries
    # Since we use when:1d, we accept all entries that have a valid date.
    recent_entries = []
    for entry in feed.entries:
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            try:
                dt_utc = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
                logging.debug(f"Accepted: {entry.title[:30]}... ({dt_utc})")
            except Exception as e:
                logging.debug(f"Error logging date: {e}")
            recent_entries.append(entry)

    return recent_entries

def generate_html(entries):
    jst_now = get_jst_time()
    date_str = jst_now.strftime("%Y年%m月%d日 %H:%M")
    date_only_str = jst_now.strftime("%Y年%m月%d日")

    html_content = f"""
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI News Headlines ({date_only_str})</title>
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
        .no-news {{
            text-align: center;
            color: #7f8c8d;
            padding: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>AI関連ニュース - {date_only_str}</h1>
        <div class="update-time">最終更新: {date_str} (JST)</div>
        <div class="news-list">
    """

    if not entries:
        html_content += """
            <div class="no-news">本日のニュースはまだありません。</div>
        """
    else:
        for entry in entries:
            # Re-format published date for display
            published_text = entry.published
            if hasattr(entry, 'published_parsed'):
                 try:
                    dt_utc = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
                    jst_tz = datetime.timezone(datetime.timedelta(hours=9))
                    dt_jst = dt_utc.astimezone(jst_tz)
                    published_text = dt_jst.strftime("%Y/%m/%d %H:%M")
                 except:
                    pass

            html_content += f"""
                <div class="news-item">
                    <div class="news-title">
                        <a href="{entry.link}" target="_blank" rel="noopener noreferrer">{entry.title}</a>
                    </div>
                    <div class="news-meta">{published_text}</div>
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
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    logging.info("Fetching news...")
    entries = fetch_ai_news()
    logging.info(f"Found {len(entries)} articles from the last 24 hours.")

    html = generate_html(entries)

    output_path = "index.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    logging.info(f"Successfully generated {output_path}")

if __name__ == "__main__":
    main()
