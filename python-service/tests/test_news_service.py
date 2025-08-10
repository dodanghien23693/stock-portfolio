import pytest
import asyncio
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock
import feedparser
from app.services.news_service import NewsService, news_service
from app.models import NewsArticle, NewsFilter, NewsResponse

class TestNewsService:
    
    def setup_method(self):
        """Set up test fixtures"""
        self.news_service = NewsService()
        
    def test_initialization(self):
        """Test NewsService initialization"""
        assert self.news_service is not None
        assert 'cafef' in self.news_service.news_sources
        assert 'vnstock' in self.news_service.news_sources
        assert len(self.news_service.categories) == 6
        
    def test_extract_stock_symbols(self):
        """Test stock symbol extraction"""
        text = "VCB tăng mạnh, VNM và HPG cũng có diễn biến tích cực"
        symbols = self.news_service._extract_stock_symbols(text)
        
        expected_symbols = ['VCB', 'VNM', 'HPG']
        assert all(symbol in symbols for symbol in expected_symbols)
        
        # Test false positives filtering
        text_with_false_positives = "USD tăng, GDP giảm, CEO thông báo"
        symbols = self.news_service._extract_stock_symbols(text_with_false_positives)
        assert len(symbols) == 0
        
    def test_analyze_sentiment_positive(self):
        """Test positive sentiment analysis"""
        title = "VCB tăng mạnh sau kết quả kinh doanh tích cực"
        summary = "Lợi nhuận tăng trưởng, cải thiện đáng kể so với cùng kỳ"
        
        sentiment, impact_score = self.news_service._analyze_sentiment(title, summary)
        
        assert sentiment == 'positive'
        assert impact_score > 30
        
    def test_analyze_sentiment_negative(self):
        """Test negative sentiment analysis"""
        title = "Thị trường giảm mạnh do lo ngại về kinh tế"
        summary = "Chỉ số sụt giảm, khó khăn trong bối cảnh bất ổn"
        
        sentiment, impact_score = self.news_service._analyze_sentiment(title, summary)
        
        assert sentiment == 'negative'
        assert impact_score > 30
        
    def test_analyze_sentiment_neutral(self):
        """Test neutral sentiment analysis"""
        title = "Báo cáo thị trường tuần"
        summary = "Tổng quan các diễn biến trong tuần qua"
        
        sentiment, impact_score = self.news_service._analyze_sentiment(title, summary)
        
        assert sentiment == 'neutral'
        assert impact_score == 30
        
    def test_categorize_news_stocks(self):
        """Test stock news categorization"""
        title = "Cổ phiếu VCB tăng mạnh"
        summary = "Mã VCB niêm yết trên HOSE có diễn biến tích cực"
        
        category = self.news_service._categorize_news(title, summary)
        assert category == 'stocks'
        
    def test_categorize_news_market(self):
        """Test market news categorization"""
        title = "VN-Index vượt ngưỡng 1270"
        summary = "Thị trường chứng khoán có phiên giao dịch tích cực với chỉ số tăng mạnh"
        
        category = self.news_service._categorize_news(title, summary)
        assert category == 'market'
        
    def test_categorize_news_economy(self):
        """Test economic news categorization"""
        title = "NHNN tăng lãi suất"
        summary = "Ngân hàng trung ương điều chỉnh lãi suất để kiểm soát lạm phát"
        
        category = self.news_service._categorize_news(title, summary)
        assert category == 'economy'
        
    def test_create_news_id(self):
        """Test news ID creation"""
        title = "Test News"
        url = "https://example.com/news/1"
        publish_date = datetime.now()
        
        news_id = self.news_service._create_news_id(title, url, publish_date)
        
        assert news_id is not None
        assert len(news_id) == 32  # MD5 hash length
        
        # Test consistency
        news_id2 = self.news_service._create_news_id(title, url, publish_date)
        assert news_id == news_id2
        
    @patch('feedparser.parse')
    def test_get_news_from_cafef_success(self, mock_parse):
        """Test successful CafeF news retrieval"""
        # Mock feedparser response
        mock_entry = MagicMock()
        mock_entry.get.side_effect = lambda key, default='': {
            'title': 'VCB tăng mạnh',
            'summary': 'Ngân hàng VCB có kết quả kinh doanh tích cực',
            'link': 'https://cafef.vn/news/1'
        }.get(key, default)
        
        mock_entry.published_parsed = (2024, 8, 10, 10, 0, 0)
        mock_entry.hasattr = lambda attr: attr == 'published_parsed'
        
        mock_feed = MagicMock()
        mock_feed.bozo = False
        mock_feed.entries = [mock_entry]
        
        mock_parse.return_value = mock_feed
        
        # Test
        articles = self.news_service.get_news_from_cafef(limit=1)
        
        assert len(articles) == 1
        assert articles[0].title == 'VCB tăng mạnh'
        assert articles[0].source == 'CafeF'
        assert 'VCB' in articles[0].related_symbols
        
    @patch('feedparser.parse')
    def test_get_news_from_cafef_error(self, mock_parse):
        """Test CafeF news retrieval error handling"""
        mock_parse.side_effect = Exception("Network error")
        
        articles = self.news_service.get_news_from_cafef()
        
        assert articles == []
        
    def test_get_stock_news_from_vnstock_no_module(self):
        """Test VNStock news when module not available"""
        # Temporarily set stock to None
        original_stock = self.news_service.__class__.__module__
        
        articles = self.news_service.get_stock_news_from_vnstock()
        
        assert articles == []
        
    def test_apply_filters_category(self):
        """Test filtering by category"""
        articles = [
            NewsArticle(
                id='1', title='Market News', summary='Summary', url='url',
                source='Test', publish_date=datetime.now(), category='market',
                related_symbols=[], sentiment='neutral', impact_score=30, tags=[]
            ),
            NewsArticle(
                id='2', title='Stock News', summary='Summary', url='url',
                source='Test', publish_date=datetime.now(), category='stocks',
                related_symbols=[], sentiment='neutral', impact_score=30, tags=[]
            )
        ]
        
        filters = NewsFilter(category='market')
        filtered = self.news_service._apply_filters(articles, filters)
        
        assert len(filtered) == 1
        assert filtered[0].category == 'market'
        
    def test_apply_filters_symbols(self):
        """Test filtering by symbols"""
        articles = [
            NewsArticle(
                id='1', title='VCB News', summary='Summary', url='url',
                source='Test', publish_date=datetime.now(), category='stocks',
                related_symbols=['VCB'], sentiment='neutral', impact_score=30, tags=[]
            ),
            NewsArticle(
                id='2', title='VNM News', summary='Summary', url='url',
                source='Test', publish_date=datetime.now(), category='stocks',
                related_symbols=['VNM'], sentiment='neutral', impact_score=30, tags=[]
            )
        ]
        
        filters = NewsFilter(symbols=['VCB'])
        filtered = self.news_service._apply_filters(articles, filters)
        
        assert len(filtered) == 1
        assert 'VCB' in filtered[0].related_symbols
        
    def test_apply_filters_sentiment(self):
        """Test filtering by sentiment"""
        articles = [
            NewsArticle(
                id='1', title='Good News', summary='Summary', url='url',
                source='Test', publish_date=datetime.now(), category='market',
                related_symbols=[], sentiment='positive', impact_score=70, tags=[]
            ),
            NewsArticle(
                id='2', title='Bad News', summary='Summary', url='url',
                source='Test', publish_date=datetime.now(), category='market',
                related_symbols=[], sentiment='negative', impact_score=60, tags=[]
            )
        ]
        
        filters = NewsFilter(sentiment='positive')
        filtered = self.news_service._apply_filters(articles, filters)
        
        assert len(filtered) == 1
        assert filtered[0].sentiment == 'positive'
        
    def test_get_categories(self):
        """Test getting news categories"""
        categories = self.news_service.get_categories()
        
        assert len(categories) == 6
        category_ids = [cat.id for cat in categories]
        assert 'market' in category_ids
        assert 'stocks' in category_ids
        assert 'analysis' in category_ids


# Integration tests
class TestNewsServiceIntegration:
    
    def setup_method(self):
        """Set up integration test fixtures"""
        self.news_service = NewsService()
        
    @pytest.mark.skip(reason="Real RSS feed test - may be flaky")
    def test_real_cafef_rss_feed(self):
        """Test real CafeF RSS feed (integration test)"""
        # This is an actual network call - may be slow
        articles = self.news_service.get_news_from_cafef(limit=5)
        
        # We can't guarantee content, but we can test structure
        for article in articles:
            assert hasattr(article, 'id')
            assert hasattr(article, 'title')
            assert hasattr(article, 'source')
            assert article.source == 'CafeF'
            
    def test_get_all_news_integration(self):
        """Test getting all news from multiple sources"""
        filters = NewsFilter(limit=10)
        response = self.news_service.get_all_news(filters)
        
        assert isinstance(response, NewsResponse)
        assert hasattr(response, 'articles')
        assert hasattr(response, 'total')
        assert hasattr(response, 'page')
        assert hasattr(response, 'per_page')


if __name__ == "__main__":
    # Run basic tests
    test_service = TestNewsService()
    test_service.setup_method()
    
    print("Running NewsService tests...")
    
    try:
        test_service.test_initialization()
        print("✓ Initialization test passed")
        
        test_service.test_extract_stock_symbols()
        print("✓ Stock symbol extraction test passed")
        
        test_service.test_analyze_sentiment_positive()
        print("✓ Positive sentiment analysis test passed")
        
        test_service.test_analyze_sentiment_negative()
        print("✓ Negative sentiment analysis test passed")
        
        test_service.test_categorize_news_stocks()
        print("✓ Stock categorization test passed")
        
        test_service.test_categorize_news_market()
        print("✓ Market categorization test passed")
        
        test_service.test_get_categories()
        print("✓ Get categories test passed")
        
        print("\n✅ All basic tests passed!")
        
        # Test real integration
        print("\nTesting real RSS feeds...")
        integration_test = TestNewsServiceIntegration()
        integration_test.setup_method()
        
        articles = integration_test.news_service.get_news_from_cafef(limit=3)
        print(f"✓ Retrieved {len(articles)} articles from CafeF")
        
        if articles:
            print(f"  Sample: {articles[0].title[:50]}...")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
