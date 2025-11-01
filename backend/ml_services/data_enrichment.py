import os
import json
import requests
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import re
from dataclasses import dataclass
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import hashlib
from dotenv import load_dotenv

load_dotenv()

@dataclass
class EnrichmentResult:
    source: str
    data: Dict
    confidence: float
    timestamp: datetime
    cache_key: str

class DataEnrichmentEngine:
    """Engine for enriching startup data from external sources"""
    
    def __init__(self):
        self.cache = {}  # In production, use Redis
        self.rate_limits = {
            'crunchbase': {'calls': 0, 'reset_time': datetime.now()},
            'linkedin': {'calls': 0, 'reset_time': datetime.now()},
            'news': {'calls': 0, 'reset_time': datetime.now()}
        }
        
        # API configurations
        self.apis = {
            'crunchbase': {
                'base_url': 'https://api.crunchbase.com/api/v4',
                'key': os.getenv('CRUNCHBASE_API_KEY'),
                'rate_limit': 200  # calls per hour
            },
            'news': {
                'base_url': 'https://newsapi.org/v2',
                'key': os.getenv('NEWS_API_KEY'),
                'rate_limit': 1000  # calls per day
            }
        }
    
    async def enrich_company_data(self, company_name: str, domain: str = None) -> Dict[str, EnrichmentResult]:
        """Enrich company data from multiple sources"""
        enrichment_tasks = [
            self._enrich_from_crunchbase(company_name, domain),
            self._enrich_from_news(company_name),
            self._enrich_from_web_scraping(company_name, domain),
            self._enrich_social_media(company_name)
        ]
        
        results = {}
        completed_tasks = await asyncio.gather(*enrichment_tasks, return_exceptions=True)
        
        for i, result in enumerate(completed_tasks):
            source_names = ['crunchbase', 'news', 'web_scraping', 'social_media']
            if not isinstance(result, Exception) and result:
                results[source_names[i]] = result
        
        return results
    
    async def _enrich_from_crunchbase(self, company_name: str, domain: str = None) -> Optional[EnrichmentResult]:
        """Enrich data from Crunchbase API"""
        if not self.apis['crunchbase']['key']:
            return None
        
        cache_key = f"crunchbase_{hashlib.md5(company_name.encode()).hexdigest()}"
        
        # Check cache
        if cache_key in self.cache:
            cached_result = self.cache[cache_key]
            if datetime.now() - cached_result.timestamp < timedelta(hours=24):
                return cached_result
        
        # Check rate limit
        if not self._check_rate_limit('crunchbase'):
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                # Search for organization
                search_url = f"{self.apis['crunchbase']['base_url']}/searches/organizations"
                params = {
                    'user_key': self.apis['crunchbase']['key'],
                    'query': company_name,
                    'limit': 5
                }
                
                async with session.get(search_url, params=params) as response:
                    if response.status == 200:
                        search_data = await response.json()
                        
                        # Find best match
                        best_match = self._find_best_company_match(
                            search_data.get('entities', []), 
                            company_name, 
                            domain
                        )
                        
                        if best_match:
                            # Get detailed organization data
                            org_id = best_match['uuid']
                            detail_url = f"{self.apis['crunchbase']['base_url']}/entities/organizations/{org_id}"
                            detail_params = {
                                'user_key': self.apis['crunchbase']['key'],
                                'card_ids': 'fields,funding_rounds,investors,acquisitions'
                            }
                            
                            async with session.get(detail_url, params=detail_params) as detail_response:
                                if detail_response.status == 200:
                                    detail_data = await detail_response.json()
                                    
                                    enriched_data = self._process_crunchbase_data(detail_data)
                                    
                                    result = EnrichmentResult(
                                        source='crunchbase',
                                        data=enriched_data,
                                        confidence=0.9,
                                        timestamp=datetime.now(),
                                        cache_key=cache_key
                                    )
                                    
                                    self.cache[cache_key] = result
                                    return result
        
        except Exception as e:
            print(f"Crunchbase enrichment error: {e}")
            return None
    
    def _process_crunchbase_data(self, raw_data: Dict) -> Dict:
        """Process raw Crunchbase data into structured format"""
        properties = raw_data.get('properties', {})
        cards = raw_data.get('cards', {})
        
        processed = {
            'basic_info': {
                'name': properties.get('name'),
                'short_description': properties.get('short_description'),
                'description': properties.get('description'),
                'website': properties.get('website'),
                'founded_on': properties.get('founded_on'),
                'employee_count': properties.get('num_employees_enum'),
                'headquarters': self._extract_headquarters(properties),
                'categories': [cat.get('value') for cat in properties.get('categories', [])]
            },
            'funding': self._extract_funding_data(cards.get('funding_rounds', {})),
            'investors': self._extract_investor_data(cards.get('investors', {})),
            'acquisitions': self._extract_acquisition_data(cards.get('acquisitions', {})),
            'financial_metrics': {
                'total_funding': properties.get('total_funding_usd'),
                'last_funding_date': properties.get('last_funding_on'),
                'last_funding_type': properties.get('last_funding_type'),
                'valuation': properties.get('post_money_valuation_usd')
            }
        }
        
        return processed
    
    def _extract_headquarters(self, properties: Dict) -> Dict:
        """Extract headquarters information"""
        return {
            'city': properties.get('location_identifiers', [{}])[0].get('value') if properties.get('location_identifiers') else None,
            'country': properties.get('location_identifiers', [{}])[-1].get('value') if properties.get('location_identifiers') else None
        }
    
    def _extract_funding_data(self, funding_card: Dict) -> List[Dict]:
        """Extract funding rounds data"""
        funding_rounds = []
        
        for round_data in funding_card.get('funding_rounds', []):
            properties = round_data.get('properties', {})
            funding_rounds.append({
                'round_type': properties.get('investment_type'),
                'announced_on': properties.get('announced_on'),
                'money_raised': properties.get('money_raised_usd'),
                'investor_count': properties.get('num_investors'),
                'lead_investors': [inv.get('name') for inv in properties.get('lead_investors', [])]
            })
        
        return funding_rounds
    
    def _extract_investor_data(self, investor_card: Dict) -> List[Dict]:
        """Extract investor information"""
        investors = []
        
        for investor_data in investor_card.get('investors', []):
            properties = investor_data.get('properties', {})
            investors.append({
                'name': properties.get('name'),
                'type': properties.get('investor_type'),
                'stage': properties.get('investor_stage')
            })
        
        return investors
    
    def _extract_acquisition_data(self, acquisition_card: Dict) -> List[Dict]:
        """Extract acquisition information"""
        acquisitions = []
        
        for acq_data in acquisition_card.get('acquisitions', []):
            properties = acq_data.get('properties', {})
            acquisitions.append({
                'acquirer': properties.get('acquirer_name'),
                'announced_on': properties.get('announced_on'),
                'price': properties.get('price_usd'),
                'acquisition_type': properties.get('acquisition_type')
            })
        
        return acquisitions
    
    async def _enrich_from_news(self, company_name: str) -> Optional[EnrichmentResult]:
        """Enrich data from news sources"""
        if not self.apis['news']['key']:
            return None
        
        cache_key = f"news_{hashlib.md5(company_name.encode()).hexdigest()}"
        
        # Check cache
        if cache_key in self.cache:
            cached_result = self.cache[cache_key]
            if datetime.now() - cached_result.timestamp < timedelta(hours=6):
                return cached_result
        
        try:
            async with aiohttp.ClientSession() as session:
                # Search for recent news
                url = f"{self.apis['news']['base_url']}/everything"
                params = {
                    'apiKey': self.apis['news']['key'],
                    'q': f'"{company_name}" startup OR funding OR investment',
                    'sortBy': 'publishedAt',
                    'pageSize': 20,
                    'language': 'en',
                    'from': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        news_data = await response.json()
                        
                        processed_news = self._process_news_data(news_data, company_name)
                        
                        result = EnrichmentResult(
                            source='news',
                            data=processed_news,
                            confidence=0.7,
                            timestamp=datetime.now(),
                            cache_key=cache_key
                        )
                        
                        self.cache[cache_key] = result
                        return result
        
        except Exception as e:
            print(f"News enrichment error: {e}")
            return None
    
    def _process_news_data(self, raw_data: Dict, company_name: str) -> Dict:
        """Process raw news data"""
        articles = raw_data.get('articles', [])
        
        # Filter relevant articles
        relevant_articles = []
        for article in articles:
            title = article.get('title', '').lower()
            description = article.get('description', '').lower()
            
            if company_name.lower() in title or company_name.lower() in description:
                relevant_articles.append({
                    'title': article.get('title'),
                    'description': article.get('description'),
                    'url': article.get('url'),
                    'published_at': article.get('publishedAt'),
                    'source': article.get('source', {}).get('name'),
                    'relevance_score': self._calculate_news_relevance(article, company_name)
                })
        
        # Sort by relevance and recency
        relevant_articles.sort(key=lambda x: (x['relevance_score'], x['published_at']), reverse=True)
        
        # Extract key insights
        insights = self._extract_news_insights(relevant_articles)
        
        return {
            'articles': relevant_articles[:10],  # Top 10 most relevant
            'insights': insights,
            'sentiment': self._analyze_news_sentiment(relevant_articles),
            'total_mentions': len(relevant_articles)
        }
    
    def _calculate_news_relevance(self, article: Dict, company_name: str) -> float:
        """Calculate relevance score for news article"""
        score = 0
        title = article.get('title', '').lower()
        description = article.get('description', '').lower()
        
        # Company name mentions
        if company_name.lower() in title:
            score += 3
        if company_name.lower() in description:
            score += 2
        
        # Funding/investment keywords
        funding_keywords = ['funding', 'investment', 'raised', 'series', 'round', 'valuation']
        for keyword in funding_keywords:
            if keyword in title:
                score += 2
            if keyword in description:
                score += 1
        
        # Business keywords
        business_keywords = ['startup', 'launch', 'growth', 'expansion', 'partnership']
        for keyword in business_keywords:
            if keyword in title:
                score += 1
            if keyword in description:
                score += 0.5
        
        return score
    
    def _extract_news_insights(self, articles: List[Dict]) -> Dict:
        """Extract key insights from news articles"""
        insights = {
            'recent_funding': [],
            'partnerships': [],
            'product_launches': [],
            'market_expansion': []
        }
        
        for article in articles:
            title = article.get('title', '').lower()
            description = article.get('description', '').lower()
            
            # Funding mentions
            funding_pattern = r'raised \$?(\d+(?:\.\d+)?)\s*(million|billion|M|B)'
            funding_matches = re.findall(funding_pattern, title + ' ' + description, re.IGNORECASE)
            if funding_matches:
                insights['recent_funding'].append({
                    'amount': funding_matches[0],
                    'source': article.get('title'),
                    'date': article.get('published_at')
                })
            
            # Partnership mentions
            if any(keyword in title for keyword in ['partnership', 'partners with', 'collaboration']):
                insights['partnerships'].append({
                    'description': article.get('title'),
                    'date': article.get('published_at')
                })
            
            # Product launches
            if any(keyword in title for keyword in ['launch', 'introduces', 'unveils', 'releases']):
                insights['product_launches'].append({
                    'description': article.get('title'),
                    'date': article.get('published_at')
                })
            
            # Market expansion
            if any(keyword in title for keyword in ['expands', 'expansion', 'enters', 'international']):
                insights['market_expansion'].append({
                    'description': article.get('title'),
                    'date': article.get('published_at')
                })
        
        return insights
    
    def _analyze_news_sentiment(self, articles: List[Dict]) -> Dict:
        """Analyze sentiment of news coverage"""
        positive_keywords = ['success', 'growth', 'raised', 'expansion', 'partnership', 'launch', 'innovative']
        negative_keywords = ['loss', 'decline', 'lawsuit', 'controversy', 'layoffs', 'struggle']
        
        positive_count = 0
        negative_count = 0
        total_articles = len(articles)
        
        for article in articles:
            text = (article.get('title', '') + ' ' + article.get('description', '')).lower()
            
            positive_score = sum(1 for keyword in positive_keywords if keyword in text)
            negative_score = sum(1 for keyword in negative_keywords if keyword in text)
            
            if positive_score > negative_score:
                positive_count += 1
            elif negative_score > positive_score:
                negative_count += 1
        
        if total_articles == 0:
            return {'sentiment': 'neutral', 'confidence': 0}
        
        positive_ratio = positive_count / total_articles
        negative_ratio = negative_count / total_articles
        
        if positive_ratio > 0.6:
            sentiment = 'positive'
        elif negative_ratio > 0.6:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'positive_ratio': positive_ratio,
            'negative_ratio': negative_ratio,
            'confidence': max(positive_ratio, negative_ratio)
        }
    
    async def _enrich_from_web_scraping(self, company_name: str, domain: str = None) -> Optional[EnrichmentResult]:
        """Enrich data through web scraping"""
        if not domain:
            return None
        
        cache_key = f"web_{hashlib.md5(domain.encode()).hexdigest()}"
        
        # Check cache
        if cache_key in self.cache:
            cached_result = self.cache[cache_key]
            if datetime.now() - cached_result.timestamp < timedelta(hours=12):
                return cached_result
        
        try:
            async with aiohttp.ClientSession() as session:
                # Scrape company website
                url = f"https://{domain}" if not domain.startswith('http') else domain
                
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        scraped_data = self._extract_website_data(soup, domain)
                        
                        result = EnrichmentResult(
                            source='web_scraping',
                            data=scraped_data,
                            confidence=0.6,
                            timestamp=datetime.now(),
                            cache_key=cache_key
                        )
                        
                        self.cache[cache_key] = result
                        return result
        
        except Exception as e:
            print(f"Web scraping error: {e}")
            return None
    
    def _extract_website_data(self, soup: BeautifulSoup, domain: str) -> Dict:
        """Extract data from company website"""
        data = {
            'meta_info': {},
            'content_analysis': {},
            'technology_stack': [],
            'social_links': {}
        }
        
        # Meta information
        title = soup.find('title')
        if title:
            data['meta_info']['title'] = title.get_text().strip()
        
        description = soup.find('meta', attrs={'name': 'description'})
        if description:
            data['meta_info']['description'] = description.get('content', '').strip()
        
        # Extract key content
        text_content = soup.get_text()
        
        # Look for key business information
        data['content_analysis'] = {
            'mentions_funding': bool(re.search(r'funding|investment|raised|series', text_content, re.IGNORECASE)),
            'mentions_customers': bool(re.search(r'customers?|clients?|users?', text_content, re.IGNORECASE)),
            'mentions_team': bool(re.search(r'team|employees?|staff', text_content, re.IGNORECASE)),
            'word_count': len(text_content.split())
        }
        
        # Extract social media links
        social_patterns = {
            'linkedin': r'linkedin\.com/company/([^/\s"\']+)',
            'twitter': r'twitter\.com/([^/\s"\']+)',
            'facebook': r'facebook\.com/([^/\s"\']+)'
        }
        
        for platform, pattern in social_patterns.items():
            matches = re.findall(pattern, str(soup), re.IGNORECASE)
            if matches:
                data['social_links'][platform] = matches[0]
        
        # Detect technology stack (basic detection)
        tech_indicators = {
            'react': 'React',
            'angular': 'Angular',
            'vue': 'Vue.js',
            'bootstrap': 'Bootstrap',
            'jquery': 'jQuery'
        }
        
        page_source = str(soup).lower()
        for indicator, tech in tech_indicators.items():
            if indicator in page_source:
                data['technology_stack'].append(tech)
        
        return data
    
    async def _enrich_social_media(self, company_name: str) -> Optional[EnrichmentResult]:
        """Enrich data from social media (placeholder for future implementation)"""
        # This would integrate with Twitter API, LinkedIn API, etc.
        # For now, return basic structure
        
        return EnrichmentResult(
            source='social_media',
            data={
                'twitter': {'followers': 0, 'engagement': 0},
                'linkedin': {'followers': 0, 'posts': []},
                'social_sentiment': 'neutral'
            },
            confidence=0.3,
            timestamp=datetime.now(),
            cache_key=f"social_{hashlib.md5(company_name.encode()).hexdigest()}"
        )
    
    def _find_best_company_match(self, entities: List[Dict], company_name: str, domain: str = None) -> Optional[Dict]:
        """Find best matching company from search results"""
        if not entities:
            return None
        
        best_match = None
        best_score = 0
        
        for entity in entities:
            properties = entity.get('properties', {})
            score = 0
            
            # Name similarity
            entity_name = properties.get('name', '').lower()
            if entity_name == company_name.lower():
                score += 10
            elif company_name.lower() in entity_name or entity_name in company_name.lower():
                score += 5
            
            # Domain match
            if domain:
                entity_website = properties.get('website', '').lower()
                if domain.lower() in entity_website:
                    score += 8
            
            # Prefer active companies
            if properties.get('status') == 'operating':
                score += 2
            
            if score > best_score:
                best_score = score
                best_match = entity
        
        return best_match if best_score >= 5 else None
    
    def _check_rate_limit(self, service: str) -> bool:
        """Check if we can make API call within rate limits"""
        now = datetime.now()
        rate_info = self.rate_limits[service]
        
        # Reset counter if hour has passed
        if now - rate_info['reset_time'] > timedelta(hours=1):
            rate_info['calls'] = 0
            rate_info['reset_time'] = now
        
        # Check if under limit
        limit = self.apis.get(service, {}).get('rate_limit', 100)
        if rate_info['calls'] < limit:
            rate_info['calls'] += 1
            return True
        
        return False
    
    def get_enrichment_summary(self, enrichment_results: Dict[str, EnrichmentResult]) -> Dict:
        """Generate summary of enrichment results"""
        summary = {
            'sources_used': list(enrichment_results.keys()),
            'total_confidence': 0,
            'key_findings': [],
            'data_freshness': {},
            'coverage_score': 0
        }
        
        if not enrichment_results:
            return summary
        
        # Calculate average confidence
        confidences = [result.confidence for result in enrichment_results.values()]
        summary['total_confidence'] = sum(confidences) / len(confidences)
        
        # Data freshness
        for source, result in enrichment_results.items():
            hours_old = (datetime.now() - result.timestamp).total_seconds() / 3600
            summary['data_freshness'][source] = f"{hours_old:.1f} hours old"
        
        # Extract key findings
        for source, result in enrichment_results.items():
            if source == 'crunchbase' and result.data.get('funding'):
                funding_rounds = result.data['funding']
                if funding_rounds:
                    latest_round = max(funding_rounds, key=lambda x: x.get('announced_on', ''))
                    summary['key_findings'].append(f"Latest funding: {latest_round.get('round_type')} round")
            
            elif source == 'news' and result.data.get('insights'):
                insights = result.data['insights']
                if insights.get('recent_funding'):
                    summary['key_findings'].append("Recent funding activity detected in news")
                if insights.get('partnerships'):
                    summary['key_findings'].append("Partnership announcements found")
        
        # Coverage score (percentage of expected data sources)
        expected_sources = ['crunchbase', 'news', 'web_scraping']
        coverage = len([s for s in expected_sources if s in enrichment_results]) / len(expected_sources)
        summary['coverage_score'] = coverage
        
        return summary

class MarketIntelligenceEngine:
    """Engine for gathering and analyzing market intelligence"""
    
    def __init__(self):
        self.data_sources = {
            'market_research': [],
            'competitor_analysis': [],
            'trend_analysis': []
        }
    
    def analyze_market_opportunity(self, company_data: Dict, enrichment_data: Dict) -> Dict:
        """Analyze market opportunity based on available data"""
        
        market_analysis = {
            'market_size': self._estimate_market_size(company_data, enrichment_data),
            'competition_analysis': self._analyze_competition(company_data, enrichment_data),
            'market_trends': self._identify_market_trends(company_data, enrichment_data),
            'timing_assessment': self._assess_market_timing(company_data, enrichment_data)
        }
        
        # Calculate overall market score
        market_analysis['overall_score'] = self._calculate_market_score(market_analysis)
        
        return market_analysis
    
    def _estimate_market_size(self, company_data: Dict, enrichment_data: Dict) -> Dict:
        """Estimate TAM/SAM/SOM based on available data"""
        
        # Extract industry/category information
        categories = []
        if 'crunchbase' in enrichment_data:
            cb_data = enrichment_data['crunchbase'].data
            categories = cb_data.get('basic_info', {}).get('categories', [])
        
        # Market size estimates (simplified - in production would use market research APIs)
        market_size_db = {
            'software': {'tam': 500, 'growth_rate': 15},
            'fintech': {'tam': 300, 'growth_rate': 20},
            'healthcare': {'tam': 400, 'growth_rate': 12},
            'ecommerce': {'tam': 600, 'growth_rate': 18},
            'saas': {'tam': 200, 'growth_rate': 25}
        }
        
        estimated_tam = 50  # Default
        estimated_growth = 10  # Default
        
        for category in categories:
            category_lower = category.lower()
            for market_key, market_data in market_size_db.items():
                if market_key in category_lower:
                    estimated_tam = market_data['tam']
                    estimated_growth = market_data['growth_rate']
                    break
        
        return {
            'estimated_tam_billions': estimated_tam,
            'estimated_growth_rate': estimated_growth,
            'confidence': 0.6,
            'data_sources': categories
        }
    
    def _analyze_competition(self, company_data: Dict, enrichment_data: Dict) -> Dict:
        """Analyze competitive landscape"""
        
        competition_analysis = {
            'competitor_count': 'medium',  # low, medium, high
            'competitive_intensity': 0.6,  # 0-1 scale
            'key_competitors': [],
            'differentiation_opportunities': []
        }
        
        # Extract competitor information from news
        if 'news' in enrichment_data:
            news_data = enrichment_data['news'].data
            articles = news_data.get('articles', [])
            
            # Look for competitor mentions
            competitor_keywords = ['competitor', 'rival', 'alternative', 'vs', 'compared to']
            for article in articles:
                title = article.get('title', '').lower()
                description = article.get('description', '').lower()
                
                for keyword in competitor_keywords:
                    if keyword in title or keyword in description:
                        competition_analysis['competitive_intensity'] += 0.1
        
        competition_analysis['competitive_intensity'] = min(1.0, competition_analysis['competitive_intensity'])
        
        return competition_analysis
    
    def _identify_market_trends(self, company_data: Dict, enrichment_data: Dict) -> Dict:
        """Identify relevant market trends"""
        
        trends = {
            'positive_trends': [],
            'negative_trends': [],
            'trend_alignment_score': 0.6
        }
        
        # Analyze news for trend indicators
        if 'news' in enrichment_data:
            news_data = enrichment_data['news'].data
            
            positive_trend_keywords = ['growing', 'increasing', 'rising', 'boom', 'expansion']
            negative_trend_keywords = ['declining', 'decreasing', 'shrinking', 'downturn']
            
            for article in news_data.get('articles', []):
                text = (article.get('title', '') + ' ' + article.get('description', '')).lower()
                
                for keyword in positive_trend_keywords:
                    if keyword in text:
                        trends['positive_trends'].append(f"Market {keyword} trend detected")
                        trends['trend_alignment_score'] += 0.05
                
                for keyword in negative_trend_keywords:
                    if keyword in text:
                        trends['negative_trends'].append(f"Market {keyword} trend detected")
                        trends['trend_alignment_score'] -= 0.05
        
        trends['trend_alignment_score'] = max(0, min(1, trends['trend_alignment_score']))
        
        return trends
    
    def _assess_market_timing(self, company_data: Dict, enrichment_data: Dict) -> Dict:
        """Assess market timing for the startup"""
        
        timing_factors = {
            'market_readiness': 0.7,
            'technology_maturity': 0.6,
            'regulatory_environment': 0.7,
            'economic_conditions': 0.6
        }
        
        # Analyze funding environment from Crunchbase data
        if 'crunchbase' in enrichment_data:
            cb_data = enrichment_data['crunchbase'].data
            funding_data = cb_data.get('funding', [])
            
            if funding_data:
                # Recent funding activity indicates good timing
                recent_funding = [f for f in funding_data if f.get('announced_on', '') > '2022-01-01']
                if recent_funding:
                    timing_factors['market_readiness'] += 0.1
        
        overall_timing_score = sum(timing_factors.values()) / len(timing_factors)
        
        return {
            'timing_factors': timing_factors,
            'overall_timing_score': overall_timing_score,
            'timing_assessment': 'Good' if overall_timing_score > 0.7 else 'Moderate' if overall_timing_score > 0.5 else 'Poor'
        }
    
    def _calculate_market_score(self, market_analysis: Dict) -> float:
        """Calculate overall market opportunity score"""
        
        weights = {
            'market_size': 0.3,
            'competition': 0.25,
            'trends': 0.25,
            'timing': 0.2
        }
        
        # Extract scores from each component
        market_size_score = min(100, market_analysis['market_size']['estimated_tam_billions'] / 5)  # Normalize
        competition_score = (1 - market_analysis['competition_analysis']['competitive_intensity']) * 100
        trends_score = market_analysis['market_trends']['trend_alignment_score'] * 100
        timing_score = market_analysis['timing_assessment']['overall_timing_score'] * 100
        
        overall_score = (
            market_size_score * weights['market_size'] +
            competition_score * weights['competition'] +
            trends_score * weights['trends'] +
            timing_score * weights['timing']
        )
        
        return round(overall_score, 1)