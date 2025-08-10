import feedparser
import requests
import pandas as pd
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import re
import hashlib
try:
    from vnstock import stock
except ImportError:
    # Fallback if stock module not available in current vnstock version
    stock = None
from ..models import NewsArticle, NewsCategory, NewsFilter, NewsResponse

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.news_sources = {
            'cafef': {
                'rss_url': 'https://cafef.vn/thi-truong-chung-khoan.rss',
                'name': 'CafeF',
                'category_mapping': self._get_cafef_categories()
            },
            'vnexpress': {
                'rss_url': 'https://vnexpress.net/rss/kinh-doanh.rss',
                'name': 'VnExpress',
                'category_mapping': self._get_vnexpress_categories()
            },
            'vnstock': {
                'name': 'VNStock',
                'api_available': True
            }
        }
        
        # Stock symbols patterns for detection
        self.stock_pattern = re.compile(r'\b([A-Z]{3,4})\b')
        
        # Common categories
        self.categories = [
            NewsCategory(id="market", name="Thị trường", description="Tin tức thị trường chung"),
            NewsCategory(id="stocks", name="Cổ phiếu", description="Tin tức về cổ phiếu cụ thể"),
            NewsCategory(id="analysis", name="Phân tích", description="Phân tích kỹ thuật và cơ bản"),
            NewsCategory(id="economy", name="Kinh tế", description="Tin tức kinh tế vĩ mô"),
            NewsCategory(id="international", name="Quốc tế", description="Tin tức thị trường quốc tế"),
            NewsCategory(id="corporate", name="Doanh nghiệp", description="Tin tức doanh nghiệp")
        ]
        
        # Cache for news to avoid duplicates
        self._news_cache = {}
        self._cache_expiry = 3600  # 1 hour
        
    def _get_cafef_categories(self) -> Dict[str, str]:
        """Map CafeF RSS categories to our internal categories"""
        return {
            'chung-khoan': 'market',
            'doanh-nghiep': 'corporate', 
            'kinh-te': 'economy',
            'quoc-te': 'international',
            'bat-dong-san': 'economy',
            'ngan-hang': 'stocks'
        }
    
    def _get_vnexpress_categories(self) -> Dict[str, str]:
        """Map VnExpress RSS categories to our internal categories"""
        return {
            'chung-khoan-bond': 'market',
            'doanh-nghiep': 'corporate',
            'kinh-te-viet-nam': 'economy',
            'kinh-te-the-gioi': 'international',
            'ebank': 'stocks',
            'bat-dong-san': 'economy'
        }
    
    def _extract_stock_symbols(self, text: str) -> List[str]:
        """Extract stock symbols from text content"""
        # Vietnamese stock symbols are typically 3 letters
        pattern = r'\b([A-Z]{3})\b'
        matches = re.findall(pattern, text.upper())
        symbols = set(matches)
        
        # Filter out common non-stock words and HTML tags
        non_stocks = {
            'USD', 'VND', 'CEO', 'CFO', 'GDP', 'CPI', 'API', 'URL', 'HTML', 'CSS', 'PDF',
            'IMG', 'SRC', 'COM', 'JPG', 'PNG', 'GIF', 'HTM', 'VAI', 'CHO', 'NAY', 'VOI',
            'CUA', 'LAM', 'THI', 'VAN', 'HAY', 'MOT', 'HAI', 'BAY', 'NAM', 'SAU', 'BON',
            'HREF', 'ZOOM', 'CROP', 'KINH', 'HANG', 'NHOM', 'DONG', 'QUAN', 'TRI', 'GIA',
            'NOP', 'LON', 'VIX', 'SHS', 'TOP', 'NEW', 'OLD', 'ETF', 'IPO', 'CHN', 'GAN',
            'SACH', 'NHA', 'NUOC', 'VAY', 'NGAN', 'SUNG', 'TIN', 'FED'
        }
        
        # Only return symbols that are not in non_stocks list and exactly 3 letters
        valid_symbols = [s for s in symbols if s not in non_stocks and len(s) == 3]
        
        return list(valid_symbols)
    
    def _analyze_sentiment(self, title: str, summary: str) -> tuple[str, float]:
        """Simple sentiment analysis for Vietnamese financial news"""
        positive_keywords = [
            'tăng', 'tích cực', 'khả quan', 'thành công', 'phát triển', 'lợi nhuận',
            'tăng trưởng', 'cải thiện', 'ký kết', 'hợp tác', 'đầu tư', 'mở rộng',
            'thuận lợi', 'hiệu quả', 'ưu việt', 'bứt phá', 'đột phá'
        ]
        
        negative_keywords = [
            'giảm', 'sụt', 'rớt', 'mất', 'thiệt hại', 'khó khăn', 'thách thức',
            'suy thoái', 'lỗ', 'âm', 'giảm sút', 'cạnh tranh', 'rủi ro',
            'bất ổn', 'lo ngại', 'căng thẳng', 'suy yếu', 'khủng hoảng'
        ]
        
        text = (title + ' ' + summary).lower()
        
        positive_score = sum(1 for word in positive_keywords if word in text)
        negative_score = sum(1 for word in negative_keywords if word in text)
        
        if positive_score > negative_score:
            sentiment = 'positive'
            impact_score = min(80, positive_score * 15 + 20)
        elif negative_score > positive_score:
            sentiment = 'negative'
            impact_score = min(80, negative_score * 15 + 20)
        else:
            sentiment = 'neutral'
            impact_score = 30
            
        return sentiment, impact_score
    
    def _categorize_news(self, title: str, summary: str, source_category: str = None) -> str:
        """Categorize news based on content"""
        text = (title + ' ' + summary).lower()
        
        # Check for stock-specific content
        if any(word in text for word in ['cổ phiếu', 'mã', 'ticker', 'niêm yết']):
            return 'stocks'
        
        # Check for market content
        if any(word in text for word in ['thị trường', 'chỉ số', 'vnindex', 'hnx', 'upcom']):
            return 'market'
        
        # Check for analysis content
        if any(word in text for word in ['phân tích', 'dự báo', 'khuyến nghị', 'đánh giá']):
            return 'analysis'
        
        # Check for corporate news
        if any(word in text for word in ['doanh nghiệp', 'công ty', 'cổ đông', 'ban điều hành']):
            return 'corporate'
        
        # Check for economic news
        if any(word in text for word in ['kinh tế', 'gdp', 'lạm phát', 'lãi suất', 'ngân hàng']):
            return 'economy'
        
        # Default category
        return source_category or 'market'
    
    def _create_news_id(self, title: str, url: str, publish_date: datetime) -> str:
        """Create unique ID for news article"""
        content = f"{title}_{url}_{publish_date.isoformat()}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get_news_from_cafef(self, limit: int = 20) -> List[NewsArticle]:
        """Get news from CafeF RSS feed"""
        try:
            news_articles = []
            feed = feedparser.parse(self.news_sources['cafef']['rss_url'])
            
            if feed.bozo:
                logger.warning("CafeF RSS feed may have issues")
            
            for entry in feed.entries[:limit]:
                try:
                    # Parse publish date from pubDate tag
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        # published_parsed is a time struct
                        publish_date = datetime(*entry.published_parsed[:6])
                    elif hasattr(entry, 'published') and entry.published:
                        # Try to parse published string
                        try:
                            import email.utils
                            publish_date = datetime.fromtimestamp(
                                email.utils.mktime_tz(email.utils.parsedate_tz(entry.published))
                            )
                        except:
                            publish_date = datetime.now()
                    else:
                        publish_date = datetime.now()
                    
                    title = entry.get('title', '')
                    summary = entry.get('summary', entry.get('description', ''))
                    url = entry.get('link', '')
                    
                    # Extract stock symbols
                    related_symbols = self._extract_stock_symbols(title + ' ' + summary)
                    
                    # Analyze sentiment and impact
                    sentiment, impact_score = self._analyze_sentiment(title, summary)
                    
                    # Categorize news
                    category = self._categorize_news(title, summary)
                    
                    # Create unique ID
                    news_id = self._create_news_id(title, url, publish_date)
                    
                    # Create tags
                    tags = ['cafef']
                    if related_symbols:
                        tags.extend(related_symbols[:3])  # Max 3 symbol tags
                    
                    news_article = NewsArticle(
                        id=news_id,
                        title=title,
                        summary=summary,
                        url=url,
                        source='CafeF',
                        publish_date=publish_date,
                        category=category,
                        related_symbols=related_symbols,
                        sentiment=sentiment,
                        impact_score=impact_score,
                        tags=tags
                    )
                    
                    news_articles.append(news_article)
                    
                except Exception as e:
                    logger.error(f"Error processing CafeF entry: {e}")
                    continue
                    
            logger.info(f"Retrieved {len(news_articles)} articles from CafeF")
            return news_articles
            
        except Exception as e:
            logger.error(f"Error fetching CafeF news: {e}")
            return []
    
    def get_news_from_vnexpress(self, limit: int = 20) -> List[NewsArticle]:
        """Get news from VnExpress RSS feed"""
        try:
            news_articles = []
            feed = feedparser.parse(self.news_sources['vnexpress']['rss_url'])
            
            if feed.bozo:
                logger.warning("VnExpress RSS feed may have issues")
            
            for entry in feed.entries[:limit]:
                try:
                    # Parse publish date from pubDate tag
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        # published_parsed is a time struct
                        publish_date = datetime(*entry.published_parsed[:6])
                    elif hasattr(entry, 'published') and entry.published:
                        # Try to parse published string
                        try:
                            import email.utils
                            publish_date = datetime.fromtimestamp(
                                email.utils.mktime_tz(email.utils.parsedate_tz(entry.published))
                            )
                        except:
                            publish_date = datetime.now()
                    else:
                        publish_date = datetime.now()
                    
                    title = entry.get('title', '')
                    summary = entry.get('summary', entry.get('description', ''))
                    url = entry.get('link', '')
                    
                    # Clean HTML tags from summary if present
                    import re
                    if summary:
                        summary = re.sub(r'<[^>]+>', '', summary)
                        summary = summary.strip()
                    
                    # Extract stock symbols
                    related_symbols = self._extract_stock_symbols(title + ' ' + summary)
                    
                    # Analyze sentiment and impact
                    sentiment, impact_score = self._analyze_sentiment(title, summary)
                    
                    # Categorize news
                    category = self._categorize_news(title, summary)
                    
                    # Create unique ID
                    news_id = self._create_news_id(title, url, publish_date)
                    
                    # Create tags
                    tags = ['vnexpress']
                    if related_symbols:
                        tags.extend(related_symbols[:3])  # Max 3 symbol tags
                    
                    news_article = NewsArticle(
                        id=news_id,
                        title=title,
                        summary=summary,
                        url=url,
                        source='VnExpress',
                        publish_date=publish_date,
                        category=category,
                        related_symbols=related_symbols,
                        sentiment=sentiment,
                        impact_score=impact_score,
                        tags=tags
                    )
                    
                    news_articles.append(news_article)
                    
                except Exception as e:
                    logger.error(f"Error processing VnExpress entry: {e}")
                    continue
                    
            logger.info(f"Retrieved {len(news_articles)} articles from VnExpress")
            return news_articles
            
        except Exception as e:
            logger.error(f"Error fetching VnExpress news: {e}")
            return []
    
    def get_stock_news_from_vnstock(self, symbol: str = None) -> List[NewsArticle]:
        """Get stock-specific news from vnstock library"""
        try:
            news_articles = []
            
            # Check if stock module is available
            if stock is None:
                logger.warning("VNStock stock module not available - returning empty list")
                return news_articles
            
            # Try to get news from vnstock
            try:
                if symbol:
                    # Get news for specific symbol
                    news_data = stock.stock_news(symbol=symbol.upper())
                else:
                    # Get general market news
                    news_data = stock.stock_news()
                    
                if news_data is not None and not news_data.empty:
                    for _, row in news_data.iterrows():
                        try:
                            title = row.get('title', '')
                            summary = row.get('content', row.get('summary', ''))
                            url = row.get('url', '')
                            
                            # Parse date
                            publish_date = datetime.now()
                            if 'pubDate' in row and row['pubDate']:
                                try:
                                    publish_date = pd.to_datetime(row['pubDate'])
                                except:
                                    pass
                            
                            # Extract stock symbols
                            related_symbols = self._extract_stock_symbols(title + ' ' + summary)
                            if symbol and symbol.upper() not in related_symbols:
                                related_symbols.insert(0, symbol.upper())
                            
                            # Analyze sentiment
                            sentiment, impact_score = self._analyze_sentiment(title, summary)
                            
                            # Categorize
                            category = 'stocks' if symbol else self._categorize_news(title, summary)
                            
                            # Create unique ID
                            news_id = self._create_news_id(title, url, publish_date)
                            
                            tags = ['vnstock']
                            if symbol:
                                tags.append(symbol.upper())
                            
                            news_article = NewsArticle(
                                id=news_id,
                                title=title,
                                summary=summary,
                                url=url,
                                source='VNStock',
                                publish_date=publish_date,
                                category=category,
                                related_symbols=related_symbols,
                                sentiment=sentiment,
                                impact_score=impact_score,
                                tags=tags
                            )
                            
                            news_articles.append(news_article)
                            
                        except Exception as e:
                            logger.error(f"Error processing vnstock news entry: {e}")
                            continue
                            
            except Exception as e:
                logger.warning(f"VNStock news API not available or failed: {e}")
                
            logger.info(f"Retrieved {len(news_articles)} articles from VNStock")
            return news_articles
            
        except Exception as e:
            logger.error(f"Error fetching VNStock news: {e}")
            return []
    
    def get_all_news(self, filters: NewsFilter = None) -> NewsResponse:
        """Get all news from all sources with optional filtering"""
        try:
            all_articles = []
            
            # Get news from CafeF
            cafef_news = self.get_news_from_cafef(limit=30)
            all_articles.extend(cafef_news)
            
            # Get news from VnExpress
            vnexpress_news = self.get_news_from_vnexpress(limit=30)
            all_articles.extend(vnexpress_news)
            
            # Get news from VNStock  
            vnstock_news = self.get_stock_news_from_vnstock()
            all_articles.extend(vnstock_news)
            
            # Remove duplicates based on ID
            seen_ids = set()
            unique_articles = []
            for article in all_articles:
                if article.id not in seen_ids:
                    seen_ids.add(article.id)
                    unique_articles.append(article)
            
            # Apply filters
            filtered_articles = self._apply_filters(unique_articles, filters)
            
            # Sort by publish date (newest first)
            filtered_articles.sort(key=lambda x: x.publish_date, reverse=True)
            
            # Pagination
            page = getattr(filters, 'page', 1) if filters else 1
            per_page = getattr(filters, 'limit', 20) if filters else 20
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            
            paginated_articles = filtered_articles[start_idx:end_idx]
            
            return NewsResponse(
                articles=paginated_articles,
                total=len(filtered_articles),
                page=page,
                per_page=per_page
            )
            
        except Exception as e:
            logger.error(f"Error getting all news: {e}")
            return NewsResponse(articles=[], total=0, page=1, per_page=20)
    
    def _apply_filters(self, articles: List[NewsArticle], filters: NewsFilter) -> List[NewsArticle]:
        """Apply filters to news articles"""
        if not filters:
            return articles
        
        filtered = articles
        
        # Filter by category
        if filters.category:
            filtered = [a for a in filtered if a.category == filters.category]
        
        # Filter by symbols
        if filters.symbols:
            symbols_upper = [s.upper() for s in filters.symbols]
            filtered = [a for a in filtered if any(s in symbols_upper for s in a.related_symbols)]
        
        # Filter by sentiment
        if filters.sentiment:
            filtered = [a for a in filtered if a.sentiment == filters.sentiment]
        
        # Filter by date range
        if filters.from_date:
            filtered = [a for a in filtered if a.publish_date >= filters.from_date]
        
        if filters.to_date:
            filtered = [a for a in filtered if a.publish_date <= filters.to_date]
        
        return filtered
    
    def get_categories(self) -> List[NewsCategory]:
        """Get available news categories"""
        return self.categories
    
    def get_news_by_symbol(self, symbol: str, limit: int = 10) -> List[NewsArticle]:
        """Get news related to specific stock symbol"""
        # First try vnstock API for symbol-specific news
        vnstock_news = self.get_stock_news_from_vnstock(symbol)
        
        # Then get general news and filter by symbol
        filters = NewsFilter(symbols=[symbol], limit=limit)
        general_news = self.get_all_news(filters)
        
        # Combine and deduplicate
        all_news = vnstock_news + general_news.articles
        seen_ids = set()
        unique_news = []
        
        for article in all_news:
            if article.id not in seen_ids:
                seen_ids.add(article.id)
                unique_news.append(article)
        
        # Sort by impact score and date
        unique_news.sort(key=lambda x: (x.impact_score or 0, x.publish_date), reverse=True)
        
        return unique_news[:limit]

# Create global instance
news_service = NewsService()
