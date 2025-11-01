import os
import requests
import json
from typing import Dict, List
import asyncio
import aiohttp
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class MarketIntelligenceEngine:
    def __init__(self):
        self.apis = {
            'news': NewsAPI(),
            'crunchbase': CrunchbaseAPI(),
            'market_data': MarketDataAPI(),
            'social': SocialIntelligenceAPI()
        }
    
    async def get_comprehensive_intelligence(self, company_name: str, sector: str) -> Dict:
        """Get comprehensive market intelligence"""
        
        tasks = [
            self.apis['news'].get_company_news(company_name),
            self.apis['news'].get_sector_news(sector),
            self.apis['crunchbase'].get_company_data(company_name),
            self.apis['crunchbase'].get_sector_funding(sector),
            self.apis['market_data'].get_market_size(sector),
            self.apis['social'].get_sentiment_analysis(company_name)
        ]
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            return {
                'company_news': results[0] if not isinstance(results[0], Exception) else {},
                'sector_news': results[1] if not isinstance(results[1], Exception) else {},
                'company_data': results[2] if not isinstance(results[2], Exception) else {},
                'sector_funding': results[3] if not isinstance(results[3], Exception) else {},
                'market_data': results[4] if not isinstance(results[4], Exception) else {},
                'sentiment': results[5] if not isinstance(results[5], Exception) else {},
                'timestamp': datetime.now().isoformat(),
                'intelligence_score': self.calculate_intelligence_score(results)
            }
        except Exception as e:
            return self.get_fallback_intelligence(company_name, sector, str(e))
    
    def calculate_intelligence_score(self, results: List) -> float:
        """Calculate intelligence quality score"""
        successful_calls = sum(1 for r in results if not isinstance(r, Exception))
        return successful_calls / len(results)
    
    def get_fallback_intelligence(self, company_name: str, sector: str, error: str) -> Dict:
        """Provide fallback intelligence when APIs fail"""
        return {
            'company_news': {'articles': [], 'sentiment': 'neutral'},
            'sector_news': {'articles': [], 'trends': []},
            'company_data': {'funding': 'N/A', 'employees': 'N/A'},
            'sector_funding': {'total_funding': 'N/A', 'deal_count': 'N/A'},
            'market_data': {'size': 'N/A', 'growth_rate': 'N/A'},
            'sentiment': {'score': 0.5, 'confidence': 'low'},
            'error': error,
            'intelligence_score': 0.0,
            'is_fallback': True
        }

class NewsAPI:
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY', 'demo_key')
        self.base_url = 'https://newsapi.org/v2'
    
    async def get_company_news(self, company_name: str) -> Dict:
        """Get recent news about the company"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/everything"
                params = {
                    'q': company_name,
                    'sortBy': 'publishedAt',
                    'pageSize': 10,
                    'apiKey': self.api_key
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self.process_news_data(data)
                    else:
                        return self.get_mock_news_data(company_name)
        except:
            return self.get_mock_news_data(company_name)
    
    async def get_sector_news(self, sector: str) -> Dict:
        """Get recent news about the sector"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/everything"
                params = {
                    'q': f"{sector} startup funding",
                    'sortBy': 'publishedAt',
                    'pageSize': 5,
                    'apiKey': self.api_key
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self.process_sector_news(data)
                    else:
                        return self.get_mock_sector_news(sector)
        except:
            return self.get_mock_sector_news(sector)
    
    def process_news_data(self, data: Dict) -> Dict:
        """Process news API response"""
        articles = data.get('articles', [])
        
        processed_articles = []
        sentiment_scores = []
        
        for article in articles[:5]:  # Limit to 5 articles
            processed_article = {
                'title': article.get('title', ''),
                'description': article.get('description', ''),
                'url': article.get('url', ''),
                'published_at': article.get('publishedAt', ''),
                'source': article.get('source', {}).get('name', '')
            }
            
            # Simple sentiment analysis
            sentiment = self.analyze_sentiment(article.get('title', '') + ' ' + article.get('description', ''))
            processed_article['sentiment'] = sentiment
            sentiment_scores.append(sentiment['score'])
            
            processed_articles.append(processed_article)
        
        overall_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
        
        return {
            'articles': processed_articles,
            'article_count': len(processed_articles),
            'overall_sentiment': overall_sentiment,
            'sentiment_label': self.get_sentiment_label(overall_sentiment)
        }
    
    def process_sector_news(self, data: Dict) -> Dict:
        """Process sector news"""
        articles = data.get('articles', [])
        
        trends = []
        for article in articles[:3]:
            trends.append({
                'title': article.get('title', ''),
                'summary': article.get('description', '')[:200] + '...' if article.get('description') else '',
                'date': article.get('publishedAt', '')
            })
        
        return {
            'trends': trends,
            'trend_count': len(trends)
        }
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Simple sentiment analysis"""
        positive_words = ['growth', 'success', 'funding', 'expansion', 'innovation', 'breakthrough']
        negative_words = ['loss', 'decline', 'failure', 'bankruptcy', 'lawsuit', 'controversy']
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            score = 0.6 + (positive_count - negative_count) * 0.1
        elif negative_count > positive_count:
            score = 0.4 - (negative_count - positive_count) * 0.1
        else:
            score = 0.5
        
        return {
            'score': max(0, min(1, score)),
            'positive_signals': positive_count,
            'negative_signals': negative_count
        }
    
    def get_sentiment_label(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score >= 0.6:
            return 'positive'
        elif score <= 0.4:
            return 'negative'
        else:
            return 'neutral'
    
    def get_mock_news_data(self, company_name: str) -> Dict:
        """Mock news data when API fails"""
        return {
            'articles': [
                {
                    'title': f'{company_name} continues growth trajectory',
                    'description': f'Recent developments show {company_name} expanding operations',
                    'sentiment': {'score': 0.6, 'positive_signals': 1, 'negative_signals': 0},
                    'published_at': datetime.now().isoformat(),
                    'source': 'Mock News'
                }
            ],
            'article_count': 1,
            'overall_sentiment': 0.6,
            'sentiment_label': 'positive',
            'is_mock': True
        }
    
    def get_mock_sector_news(self, sector: str) -> Dict:
        """Mock sector news when API fails"""
        return {
            'trends': [
                {
                    'title': f'{sector} sector shows strong investment activity',
                    'summary': f'Recent funding rounds in {sector} indicate healthy market conditions',
                    'date': datetime.now().isoformat()
                }
            ],
            'trend_count': 1,
            'is_mock': True
        }

class CrunchbaseAPI:
    def __init__(self):
        self.api_key = os.getenv('CRUNCHBASE_API_KEY', 'demo_key')
        self.base_url = 'https://api.crunchbase.com/api/v4'
    
    async def get_company_data(self, company_name: str) -> Dict:
        """Get company data from Crunchbase"""
        # Mock implementation - replace with actual API calls
        return self.get_mock_company_data(company_name)
    
    async def get_sector_funding(self, sector: str) -> Dict:
        """Get sector funding data"""
        # Mock implementation - replace with actual API calls
        return self.get_mock_sector_funding(sector)
    
    def get_mock_company_data(self, company_name: str) -> Dict:
        """Mock company data"""
        return {
            'name': company_name,
            'total_funding': '$2.5M',
            'funding_rounds': 2,
            'last_funding_date': '2024-01-15',
            'employee_count': '11-50',
            'founded_date': '2022-03-01',
            'headquarters': 'San Francisco, CA',
            'website': f'https://{company_name.lower().replace(" ", "")}.com',
            'is_mock': True
        }
    
    def get_mock_sector_funding(self, sector: str) -> Dict:
        """Mock sector funding data"""
        return {
            'sector': sector,
            'total_funding_ytd': '$2.1B',
            'deal_count_ytd': 156,
            'average_deal_size': '$13.5M',
            'top_investors': ['Sequoia Capital', 'Andreessen Horowitz', 'Accel'],
            'funding_trend': 'increasing',
            'is_mock': True
        }

class MarketDataAPI:
    def __init__(self):
        self.data_sources = ['IBISWorld', 'Statista', 'Grand View Research']
    
    async def get_market_size(self, sector: str) -> Dict:
        """Get market size data"""
        # Mock implementation - replace with actual market data APIs
        return self.get_mock_market_data(sector)
    
    def get_mock_market_data(self, sector: str) -> Dict:
        """Mock market data"""
        market_sizes = {
            'fintech': {'size': '$312B', 'growth_rate': '23.4%'},
            'healthtech': {'size': '$659B', 'growth_rate': '15.1%'},
            'edtech': {'size': '$89B', 'growth_rate': '19.9%'},
            'saas': {'size': '$195B', 'growth_rate': '18.7%'},
            'default': {'size': '$150B', 'growth_rate': '12.5%'}
        }
        
        data = market_sizes.get(sector.lower(), market_sizes['default'])
        
        return {
            'sector': sector,
            'market_size_2024': data['size'],
            'cagr_2024_2029': data['growth_rate'],
            'key_drivers': [
                'Digital transformation',
                'Increased adoption',
                'Regulatory support'
            ],
            'geographic_leaders': ['North America', 'Europe', 'Asia-Pacific'],
            'is_mock': True
        }

class SocialIntelligenceAPI:
    def __init__(self):
        self.platforms = ['twitter', 'linkedin', 'reddit']
    
    async def get_sentiment_analysis(self, company_name: str) -> Dict:
        """Get social media sentiment"""
        # Mock implementation - replace with actual social media APIs
        return self.get_mock_sentiment(company_name)
    
    def get_mock_sentiment(self, company_name: str) -> Dict:
        """Mock sentiment data"""
        return {
            'overall_sentiment': 0.65,
            'sentiment_label': 'positive',
            'mention_count': 127,
            'engagement_rate': 0.08,
            'top_topics': ['innovation', 'growth', 'funding'],
            'platform_breakdown': {
                'twitter': {'sentiment': 0.7, 'mentions': 45},
                'linkedin': {'sentiment': 0.8, 'mentions': 32},
                'reddit': {'sentiment': 0.5, 'mentions': 50}
            },
            'confidence': 0.7,
            'is_mock': True
        }

class CompetitiveAnalyzer:
    def __init__(self):
        self.market_intelligence = MarketIntelligenceEngine()
    
    async def analyze_competition(self, company_data: Dict) -> Dict:
        """Analyze competitive landscape"""
        company_name = company_data.get('name', 'Unknown')
        sector = company_data.get('sector', 'Technology')
        
        # Get market intelligence
        market_intel = await self.market_intelligence.get_comprehensive_intelligence(company_name, sector)
        
        return {
            'direct_competitors': self.identify_direct_competitors(sector),
            'indirect_competitors': self.identify_indirect_competitors(sector),
            'competitive_advantages': self.identify_advantages(company_data),
            'market_positioning': self.analyze_positioning(company_data, market_intel),
            'competitive_threats': self.assess_threats(sector, market_intel),
            'market_share_estimate': self.estimate_market_share(company_data),
            'differentiation_score': self.calculate_differentiation_score(company_data)
        }
    
    def identify_direct_competitors(self, sector: str) -> List[Dict]:
        """Identify direct competitors"""
        competitor_db = {
            'fintech': [
                {'name': 'Stripe', 'funding': '$2.2B', 'stage': 'Late Stage'},
                {'name': 'Square', 'funding': '$590M', 'stage': 'Public'},
                {'name': 'Plaid', 'funding': '$734M', 'stage': 'Late Stage'}
            ],
            'healthtech': [
                {'name': 'Teladoc', 'funding': '$1.2B', 'stage': 'Public'},
                {'name': 'Veracyte', 'funding': '$200M', 'stage': 'Public'},
                {'name': 'Oscar Health', 'funding': '$1.6B', 'stage': 'Public'}
            ],
            'default': [
                {'name': 'Competitor A', 'funding': '$50M', 'stage': 'Series B'},
                {'name': 'Competitor B', 'funding': '$25M', 'stage': 'Series A'}
            ]
        }
        
        return competitor_db.get(sector.lower(), competitor_db['default'])
    
    def identify_indirect_competitors(self, sector: str) -> List[str]:
        """Identify indirect competitors"""
        return [
            'Traditional industry players',
            'Adjacent technology solutions',
            'DIY/in-house solutions'
        ]
    
    def identify_advantages(self, company_data: Dict) -> List[str]:
        """Identify competitive advantages"""
        advantages = []
        
        # Check for technology advantages
        if 'ai' in str(company_data).lower() or 'machine learning' in str(company_data).lower():
            advantages.append('Advanced AI/ML technology')
        
        # Check for team advantages
        if company_data.get('team_info', {}).get('founders'):
            advantages.append('Experienced founding team')
        
        # Check for market timing
        advantages.append('First-mover advantage in niche')
        advantages.append('Strong product-market fit')
        
        return advantages
    
    def analyze_positioning(self, company_data: Dict, market_intel: Dict) -> Dict:
        """Analyze market positioning"""
        return {
            'market_segment': 'Mid-market',
            'value_proposition': 'Cost-effective innovation',
            'target_customers': 'SMB to Enterprise',
            'pricing_strategy': 'Competitive pricing',
            'go_to_market': 'Direct sales + partnerships'
        }
    
    def assess_threats(self, sector: str, market_intel: Dict) -> List[Dict]:
        """Assess competitive threats"""
        return [
            {
                'threat': 'Large tech companies entering market',
                'probability': 'Medium',
                'impact': 'High',
                'mitigation': 'Focus on niche specialization'
            },
            {
                'threat': 'Economic downturn affecting funding',
                'probability': 'Low',
                'impact': 'Medium',
                'mitigation': 'Diversify revenue streams'
            }
        ]
    
    def estimate_market_share(self, company_data: Dict) -> str:
        """Estimate current market share"""
        # Simple estimation based on company stage
        funding = company_data.get('financial_data', {}).get('funding', '0')
        
        if 'M' in funding:
            return '< 1%'
        elif 'B' in funding:
            return '1-5%'
        else:
            return '< 0.1%'
    
    def calculate_differentiation_score(self, company_data: Dict) -> int:
        """Calculate differentiation score"""
        score = 50  # Base score
        
        # Add points for unique features
        if 'patent' in str(company_data).lower():
            score += 15
        
        if 'proprietary' in str(company_data).lower():
            score += 10
        
        if company_data.get('team_info', {}).get('founders'):
            score += 10
        
        return min(100, score)