import unittest
from unittest.mock import MagicMock, patch
import datetime
import news_collector

class TestNewsCollector(unittest.TestCase):
    def test_generate_html_structure(self):
        # Mock entries
        mock_entry = MagicMock()
        mock_entry.title = "Test Article"
        mock_entry.link = "http://example.com/article"
        mock_entry.published = "Mon, 01 Jan 2024 00:00:00 GMT"
        mock_entry.published_parsed = (2024, 1, 1, 0, 0, 0, 0, 1, 0)

        entries = [mock_entry]

        # Mock datetime to have consistent output
        mock_now = datetime.datetime(2024, 1, 1, 12, 0, 0, tzinfo=datetime.timezone.utc)

        with patch('news_collector.get_jst_time') as mock_get_jst_time:
            # get_jst_time returns JST time. 12:00 UTC is 21:00 JST.
            jst_tz = datetime.timezone(datetime.timedelta(hours=9))
            mock_get_jst_time.return_value = mock_now.astimezone(jst_tz)

            html = news_collector.generate_html(entries)

            self.assertIn("Test Article", html)
            self.assertIn("http://example.com/article", html)
            self.assertIn("2024/01/01 09:00", html) # specific article time converted to JST
            self.assertIn("2024年01月01日", html) # page title date

    def test_generate_html_empty(self):
        with patch('news_collector.get_jst_time') as mock_get_jst_time:
            jst_tz = datetime.timezone(datetime.timedelta(hours=9))
            mock_now = datetime.datetime(2024, 1, 1, 12, 0, 0, tzinfo=datetime.timezone.utc)
            mock_get_jst_time.return_value = mock_now.astimezone(jst_tz)

            html = news_collector.generate_html([])
            self.assertIn("本日のニュースはまだありません。", html)

if __name__ == '__main__':
    unittest.main()
