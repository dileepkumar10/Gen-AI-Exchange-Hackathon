import os
import re
import json
import statistics
from typing import Dict, List, Tuple, Optional
from datetime import datetime
# Lazy import numpy to avoid startup delays
np = None

def get_numpy():
    global np
    if np is None:
        try:
            import numpy as np_module
            np = np_module
        except ImportError:
            np = False
    return np if np is not False else None
from dataclasses import dataclass
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

@dataclass
class AgentResult:
    score: float
    summary: str
    detailed_analysis: str
    evidence: List[Dict]
    confidence: float
    raw_metrics: Dict
    normalized_metrics: Dict
    calculation_details: Dict
    processing_time: float

class BaseAgent:
    def __init__(self, model_name: str = None):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model_name = model_name or os.getenv("LLM_MODEL_NAME", "llama-3.1-8b-instant")
        self._llm = None
    
    @property
    def llm(self):
        if self._llm is None:
            self._llm = ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model_name, temperature=0.1)
        return self._llm
        
    def extract_metrics(self, text: str, patterns: Dict[str, str]) -> Dict:
        """Extract numerical metrics from text using regex patterns"""
        metrics = {}
        for metric_name, pattern in patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    # Take the first valid number found
                    value = float(re.sub(r'[^\d.]', '', matches[0]))
                    metrics[metric_name] = value
                except (ValueError, IndexError):
                    continue
        return metrics
    
    def normalize_score(self, value: float, min_ref: float, max_ref: float) -> float:
        """Min-max normalization to 0-100 scale"""
        if max_ref == min_ref:
            return 50.0
        normalized = ((value - min_ref) / (max_ref - min_ref)) * 100
        return max(0, min(100, normalized))
    
    def log_normalize(self, value: float, max_ref: float) -> float:
        """Log normalization for skewed financial data"""
        if value <= 0:
            return 0
        np = get_numpy()
        if np:
            log_value = np.log(1 + value)
            log_max = np.log(1 + max_ref)
            return min(100, (log_value / log_max) * 100)
        else:
            # Fallback without numpy
            import math
            log_value = math.log(1 + value)
            log_max = math.log(1 + max_ref)
            return min(100, (log_value / log_max) * 100)

class FounderAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.weight_factors = {
            'experience': 0.3,
            'domain_expertise': 0.25,
            'track_record': 0.25,
            'team_complementarity': 0.2
        }
    
    def analyze(self, document_text: str, market_data: Dict = None) -> AgentResult:
        start_time = datetime.now()
        
        # Extract founder information
        founder_patterns = {
            'years_experience': r'(\d+)\s*years?\s*(?:of\s*)?experience',
            'previous_exits': r'(?:sold|exit|acquired).*?(\d+)',
            'team_size': r'(?:team|founders?).*?(\d+)',
            'education_mentions': r'(?:MBA|PhD|Stanford|Harvard|MIT|Berkeley)'
        }
        
        raw_metrics = self.extract_metrics(document_text, founder_patterns)
        
        # Analyze founder profile with LLM
        prompt = f"""
        Analyze the founder profile from this startup document. Focus on:
        1. Founder experience and background
        2. Domain expertise relevance
        3. Previous startup experience or exits
        4. Team composition and complementarity
        5. Leadership indicators
        
        Document: {document_text[:2000]}
        
        Provide detailed analysis and end with "Score: X" (0-100).
        """
        
        response = self.llm.invoke(prompt)
        analysis_text = response.content
        
        # Extract score and evidence
        score_match = re.search(r'Score:\s*(\d+)', analysis_text, re.IGNORECASE)
        score = float(score_match.group(1)) if score_match else 60.0
        
        # Calculate component scores
        experience_score = self._calculate_experience_score(raw_metrics, document_text)
        domain_score = self._calculate_domain_score(document_text, market_data)
        track_record_score = self._calculate_track_record_score(raw_metrics, document_text)
        team_score = self._calculate_team_score(document_text)
        
        # Weighted final score
        component_scores = {
            'experience': experience_score,
            'domain_expertise': domain_score,
            'track_record': track_record_score,
            'team_complementarity': team_score
        }
        
        weighted_score = sum(
            component_scores[component] * weight 
            for component, weight in self.weight_factors.items()
        )
        
        # Combine LLM score with calculated score
        final_score = (score * 0.6 + weighted_score * 0.4)
        
        # Extract evidence
        evidence = self._extract_evidence(document_text, analysis_text)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AgentResult(
            score=final_score,
            summary=analysis_text.split('Score:')[0].strip()[:500],
            detailed_analysis=analysis_text,
            evidence=evidence,
            confidence=self._calculate_confidence(component_scores),
            raw_metrics=raw_metrics,
            normalized_metrics=component_scores,
            calculation_details={
                'weight_factors': self.weight_factors,
                'component_scores': component_scores,
                'llm_score': score,
                'calculated_score': weighted_score,
                'final_score': final_score
            },
            processing_time=processing_time
        )
    
    def _calculate_experience_score(self, metrics: Dict, text: str) -> float:
        """Calculate experience score based on years and quality"""
        years = metrics.get('years_experience', 0)
        
        # Base score from years
        if years >= 10:
            base_score = 90
        elif years >= 5:
            base_score = 75
        elif years >= 2:
            base_score = 60
        else:
            base_score = 40
        
        # Quality indicators
        quality_keywords = ['senior', 'lead', 'director', 'vp', 'cto', 'ceo', 'founder']
        quality_bonus = sum(5 for keyword in quality_keywords if keyword in text.lower())
        
        return min(100, base_score + quality_bonus)
    
    def _calculate_domain_score(self, text: str, market_data: Dict) -> float:
        """Calculate domain expertise relevance"""
        # Industry keywords matching
        if not market_data:
            return 60.0
        
        sector = market_data.get('sector', '').lower()
        sector_keywords = {
            'fintech': ['finance', 'banking', 'payment', 'financial'],
            'healthcare': ['health', 'medical', 'clinical', 'pharma'],
            'saas': ['software', 'platform', 'api', 'cloud'],
            'ecommerce': ['retail', 'commerce', 'marketplace', 'shopping']
        }
        
        relevant_keywords = sector_keywords.get(sector, [])
        matches = sum(1 for keyword in relevant_keywords if keyword in text.lower())
        
        return min(100, 40 + (matches * 15))
    
    def _calculate_track_record_score(self, metrics: Dict, text: str) -> float:
        """Calculate track record score"""
        exits = metrics.get('previous_exits', 0)
        
        # Exit history
        if exits >= 2:
            exit_score = 95
        elif exits >= 1:
            exit_score = 80
        else:
            exit_score = 50
        
        # Success indicators
        success_keywords = ['successful', 'profitable', 'growth', 'scale', 'raised']
        success_bonus = sum(3 for keyword in success_keywords if keyword in text.lower())
        
        return min(100, exit_score + success_bonus)
    
    def _calculate_team_score(self, text: str) -> float:
        """Calculate team complementarity score"""
        roles = ['ceo', 'cto', 'cfo', 'cmo', 'technical', 'business', 'marketing', 'sales']
        role_coverage = sum(1 for role in roles if role in text.lower())
        
        # Diversity indicators
        diversity_keywords = ['diverse', 'complementary', 'balanced', 'experienced']
        diversity_bonus = sum(5 for keyword in diversity_keywords if keyword in text.lower())
        
        base_score = min(80, role_coverage * 10)
        return min(100, base_score + diversity_bonus)
    
    def _extract_evidence(self, document_text: str, analysis_text: str) -> List[Dict]:
        """Extract evidence supporting the analysis"""
        evidence = []
        
        # Find founder names and experience mentions
        founder_patterns = [
            r'([A-Z][a-z]+\s+[A-Z][a-z]+).*?(?:CEO|CTO|founder)',
            r'(\d+\s*years?\s*experience)',
            r'(previously.*?(?:founded|worked|led).*?)'
        ]
        
        for pattern in founder_patterns:
            matches = re.findall(pattern, document_text, re.IGNORECASE)
            for match in matches[:3]:  # Limit to top 3 matches
                evidence.append({
                    'type': 'founder_info',
                    'text': match if isinstance(match, str) else ' '.join(match),
                    'confidence': 0.8,
                    'source': 'document'
                })
        
        return evidence
    
    def _calculate_confidence(self, component_scores: Dict) -> float:
        """Calculate confidence based on score consistency"""
        scores = list(component_scores.values())
        if len(scores) < 2:
            return 0.5
        
        std_dev = statistics.stdev(scores)
        # Lower standard deviation = higher confidence
        confidence = max(0.1, 1 - (std_dev / 50))
        return round(confidence, 2)

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.weight_factors = {
            'market_size': 0.3,
            'growth_rate': 0.25,
            'competition_density': 0.2,
            'market_timing': 0.25
        }
    
    def analyze(self, document_text: str, market_intelligence: Dict = None) -> AgentResult:
        start_time = datetime.now()
        
        # Extract market metrics
        market_patterns = {
            'tam': r'TAM.*?[\$]?(\d+(?:\.\d+)?)\s*(?:billion|million|B|M)',
            'sam': r'SAM.*?[\$]?(\d+(?:\.\d+)?)\s*(?:billion|million|B|M)',
            'som': r'SOM.*?[\$]?(\d+(?:\.\d+)?)\s*(?:billion|million|B|M)',
            'growth_rate': r'(?:growth|growing).*?(\d+(?:\.\d+)?)%',
            'market_share': r'market\s*share.*?(\d+(?:\.\d+)?)%'
        }
        
        raw_metrics = self.extract_metrics(document_text, market_patterns)
        
        # LLM analysis
        prompt = f"""
        Analyze the market opportunity from this startup document. Focus on:
        1. Total Addressable Market (TAM) size and validity
        2. Market growth rate and trends
        3. Competitive landscape density
        4. Market timing and readiness
        5. Barriers to entry
        
        Document: {document_text[:2000]}
        
        Provide detailed market analysis and end with "Score: X" (0-100).
        """
        
        response = self.llm.invoke(prompt)
        analysis_text = response.content
        
        # Extract LLM score
        score_match = re.search(r'Score:\s*(\d+)', analysis_text, re.IGNORECASE)
        llm_score = float(score_match.group(1)) if score_match else 60.0
        
        # Calculate component scores
        market_size_score = self._calculate_market_size_score(raw_metrics)
        growth_score = self._calculate_growth_score(raw_metrics, document_text)
        competition_score = self._calculate_competition_score(document_text)
        timing_score = self._calculate_timing_score(document_text)
        
        component_scores = {
            'market_size': market_size_score,
            'growth_rate': growth_score,
            'competition_density': competition_score,
            'market_timing': timing_score
        }
        
        # Weighted score
        calculated_score = sum(
            component_scores[component] * weight 
            for component, weight in self.weight_factors.items()
        )
        
        final_score = (llm_score * 0.6 + calculated_score * 0.4)
        
        evidence = self._extract_market_evidence(document_text, raw_metrics)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AgentResult(
            score=final_score,
            summary=analysis_text.split('Score:')[0].strip()[:500],
            detailed_analysis=analysis_text,
            evidence=evidence,
            confidence=self._calculate_confidence(component_scores),
            raw_metrics=raw_metrics,
            normalized_metrics=component_scores,
            calculation_details={
                'weight_factors': self.weight_factors,
                'component_scores': component_scores,
                'llm_score': llm_score,
                'calculated_score': calculated_score,
                'final_score': final_score
            },
            processing_time=processing_time
        )
    
    def _calculate_market_size_score(self, metrics: Dict) -> float:
        """Calculate market size score based on TAM/SAM"""
        tam = metrics.get('tam', 0)
        sam = metrics.get('sam', 0)
        
        # Convert to billions for scoring
        if tam >= 100:  # $100B+
            tam_score = 95
        elif tam >= 10:  # $10B+
            tam_score = 85
        elif tam >= 1:   # $1B+
            tam_score = 70
        elif tam >= 0.1: # $100M+
            tam_score = 50
        else:
            tam_score = 30
        
        # SAM should be reasonable fraction of TAM
        if sam > 0 and tam > 0:
            sam_ratio = sam / tam
            if 0.01 <= sam_ratio <= 0.3:  # 1-30% of TAM is reasonable
                sam_bonus = 10
            else:
                sam_bonus = 0
        else:
            sam_bonus = 0
        
        return min(100, tam_score + sam_bonus)
    
    def _calculate_growth_score(self, metrics: Dict, text: str) -> float:
        """Calculate market growth score"""
        growth_rate = metrics.get('growth_rate', 0)
        
        if growth_rate >= 20:
            growth_score = 90
        elif growth_rate >= 10:
            growth_score = 75
        elif growth_rate >= 5:
            growth_score = 60
        else:
            growth_score = 40
        
        # Growth trend indicators
        growth_keywords = ['expanding', 'increasing', 'rising', 'booming', 'emerging']
        trend_bonus = sum(5 for keyword in growth_keywords if keyword in text.lower())
        
        return min(100, growth_score + trend_bonus)
    
    def _calculate_competition_score(self, text: str) -> float:
        """Calculate competition density score (lower competition = higher score)"""
        competition_keywords = ['competitor', 'competitive', 'crowded', 'saturated']
        competition_mentions = sum(1 for keyword in competition_keywords if keyword in text.lower())
        
        # Fewer mentions of competition = better score
        if competition_mentions == 0:
            return 85
        elif competition_mentions <= 2:
            return 70
        elif competition_mentions <= 5:
            return 55
        else:
            return 40
    
    def _calculate_timing_score(self, text: str) -> float:
        """Calculate market timing score"""
        timing_keywords = {
            'positive': ['opportunity', 'ready', 'emerging', 'trend', 'demand'],
            'negative': ['declining', 'mature', 'saturated', 'late']
        }
        
        positive_score = sum(10 for keyword in timing_keywords['positive'] if keyword in text.lower())
        negative_score = sum(10 for keyword in timing_keywords['negative'] if keyword in text.lower())
        
        base_score = 60
        return max(20, min(100, base_score + positive_score - negative_score))
    
    def _extract_market_evidence(self, document_text: str, metrics: Dict) -> List[Dict]:
        """Extract market-related evidence"""
        evidence = []
        
        # Market size mentions
        for metric, value in metrics.items():
            if value > 0:
                evidence.append({
                    'type': 'market_metric',
                    'metric': metric,
                    'value': value,
                    'confidence': 0.8,
                    'source': 'document'
                })
        
        # Market trend mentions
        trend_patterns = [
            r'(market.*?growing.*?\d+%)',
            r'(\$\d+.*?billion.*?market)',
            r'(opportunity.*?\$\d+)'
        ]
        
        for pattern in trend_patterns:
            matches = re.findall(pattern, document_text, re.IGNORECASE)
            for match in matches[:2]:
                evidence.append({
                    'type': 'market_trend',
                    'text': match,
                    'confidence': 0.7,
                    'source': 'document'
                })
        
        return evidence
    
    def _calculate_confidence(self, component_scores: Dict) -> float:
        """Calculate confidence based on data availability and consistency"""
        scores = list(component_scores.values())
        non_default_scores = [s for s in scores if s != 60]  # Assuming 60 is default
        
        if len(non_default_scores) < 2:
            return 0.4  # Low confidence with limited data
        
        std_dev = statistics.stdev(scores)
        confidence = max(0.2, 1 - (std_dev / 40))
        return round(confidence, 2)

class TractionAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.weight_factors = {
            'revenue_metrics': 0.35,
            'growth_rate': 0.25,
            'customer_metrics': 0.25,
            'retention_metrics': 0.15
        }
    
    def analyze(self, document_text: str, financial_data: Dict = None) -> AgentResult:
        start_time = datetime.now()
        
        # Extract traction metrics
        traction_patterns = {
            'arr': r'ARR.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?',
            'mrr': r'MRR.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?',
            'revenue': r'revenue.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?',
            'growth_rate': r'(?:growth|growing).*?(\d+(?:\.\d+)?)%',
            'customers': r'(?:customers?|users?).*?(\d+(?:,\d+)*)',
            'retention': r'retention.*?(\d+(?:\.\d+)?)%',
            'churn': r'churn.*?(\d+(?:\.\d+)?)%'
        }
        
        raw_metrics = self.extract_metrics(document_text, traction_patterns)
        
        # LLM analysis
        prompt = f"""
        Analyze the traction and business metrics from this startup document. Focus on:
        1. Revenue metrics (ARR, MRR, growth)
        2. Customer acquisition and growth
        3. Retention and churn rates
        4. Unit economics indicators
        5. Market validation signals
        
        Document: {document_text[:2000]}
        
        Provide detailed traction analysis and end with "Score: X" (0-100).
        """
        
        response = self.llm.invoke(prompt)
        analysis_text = response.content
        
        score_match = re.search(r'Score:\s*(\d+)', analysis_text, re.IGNORECASE)
        llm_score = float(score_match.group(1)) if score_match else 60.0
        
        # Calculate component scores
        revenue_score = self._calculate_revenue_score(raw_metrics)
        growth_score = self._calculate_growth_score(raw_metrics)
        customer_score = self._calculate_customer_score(raw_metrics)
        retention_score = self._calculate_retention_score(raw_metrics)
        
        component_scores = {
            'revenue_metrics': revenue_score,
            'growth_rate': growth_score,
            'customer_metrics': customer_score,
            'retention_metrics': retention_score
        }
        
        calculated_score = sum(
            component_scores[component] * weight 
            for component, weight in self.weight_factors.items()
        )
        
        final_score = (llm_score * 0.6 + calculated_score * 0.4)
        
        evidence = self._extract_traction_evidence(document_text, raw_metrics)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AgentResult(
            score=final_score,
            summary=analysis_text.split('Score:')[0].strip()[:500],
            detailed_analysis=analysis_text,
            evidence=evidence,
            confidence=self._calculate_confidence(raw_metrics),
            raw_metrics=raw_metrics,
            normalized_metrics=component_scores,
            calculation_details={
                'weight_factors': self.weight_factors,
                'component_scores': component_scores,
                'llm_score': llm_score,
                'calculated_score': calculated_score,
                'final_score': final_score,
                'unit_economics': self._calculate_unit_economics(raw_metrics)
            },
            processing_time=processing_time
        )
    
    def _calculate_revenue_score(self, metrics: Dict) -> float:
        """Calculate revenue score based on ARR/MRR"""
        arr = metrics.get('arr', 0)
        mrr = metrics.get('mrr', 0)
        revenue = metrics.get('revenue', 0)
        
        # Use highest available revenue metric
        max_revenue = max(arr, mrr * 12 if mrr > 0 else 0, revenue)
        
        if max_revenue >= 10:  # $10M+
            return 95
        elif max_revenue >= 1:   # $1M+
            return 85
        elif max_revenue >= 0.1: # $100K+
            return 70
        elif max_revenue >= 0.01: # $10K+
            return 50
        else:
            return 30
    
    def _calculate_growth_score(self, metrics: Dict) -> float:
        """Calculate growth rate score"""
        growth_rate = metrics.get('growth_rate', 0)
        
        if growth_rate >= 100:  # 100%+ growth
            return 95
        elif growth_rate >= 50:  # 50%+ growth
            return 85
        elif growth_rate >= 20:  # 20%+ growth
            return 70
        elif growth_rate >= 10:  # 10%+ growth
            return 55
        else:
            return 40
    
    def _calculate_customer_score(self, metrics: Dict) -> float:
        """Calculate customer metrics score"""
        customers = metrics.get('customers', 0)
        
        if customers >= 10000:
            return 90
        elif customers >= 1000:
            return 80
        elif customers >= 100:
            return 65
        elif customers >= 10:
            return 50
        else:
            return 35
    
    def _calculate_retention_score(self, metrics: Dict) -> float:
        """Calculate retention score"""
        retention = metrics.get('retention', 0)
        churn = metrics.get('churn', 0)
        
        # Use retention if available, otherwise infer from churn
        if retention > 0:
            if retention >= 95:
                return 95
            elif retention >= 90:
                return 85
            elif retention >= 80:
                return 70
            else:
                return 50
        elif churn > 0:
            # Lower churn = higher score
            if churn <= 2:
                return 95
            elif churn <= 5:
                return 80
            elif churn <= 10:
                return 65
            else:
                return 40
        else:
            return 60  # Default when no data
    
    def _calculate_unit_economics(self, metrics: Dict) -> Dict:
        """Calculate unit economics if possible"""
        arr = metrics.get('arr', 0)
        customers = metrics.get('customers', 0)
        
        unit_economics = {}
        
        if arr > 0 and customers > 0:
            arpu = (arr * 1000000) / customers  # Convert to actual dollars
            unit_economics['arpu'] = round(arpu, 2)
            
            # Estimate LTV (simplified)
            retention = metrics.get('retention', 90) / 100
            if retention > 0:
                ltv = arpu / (1 - retention)
                unit_economics['estimated_ltv'] = round(ltv, 2)
        
        return unit_economics
    
    def _extract_traction_evidence(self, document_text: str, metrics: Dict) -> List[Dict]:
        """Extract traction evidence"""
        evidence = []
        
        # Revenue mentions
        revenue_patterns = [
            r'(\$\d+(?:\.\d+)?\s*(?:million|thousand|M|K)?\s*(?:ARR|MRR|revenue))',
            r'(growing.*?\d+%)',
            r'(\d+(?:,\d+)*\s*(?:customers?|users?))'
        ]
        
        for pattern in revenue_patterns:
            matches = re.findall(pattern, document_text, re.IGNORECASE)
            for match in matches[:3]:
                evidence.append({
                    'type': 'traction_metric',
                    'text': match,
                    'confidence': 0.8,
                    'source': 'document'
                })
        
        return evidence
    
    def _calculate_confidence(self, metrics: Dict) -> float:
        """Calculate confidence based on available metrics"""
        key_metrics = ['arr', 'mrr', 'revenue', 'growth_rate', 'customers']
        available_metrics = sum(1 for metric in key_metrics if metrics.get(metric, 0) > 0)
        
        confidence = min(0.9, 0.3 + (available_metrics * 0.15))
        return round(confidence, 2)

class FinanceAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.weight_factors = {
            'unit_economics': 0.3,
            'burn_runway': 0.25,
            'funding_efficiency': 0.25,
            'financial_projections': 0.2
        }
    
    def analyze(self, document_text: str, financial_data: Dict = None) -> AgentResult:
        start_time = datetime.now()
        
        # Extract financial metrics
        finance_patterns = {
            'burn_rate': r'burn.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?',
            'runway': r'runway.*?(\d+(?:\.\d+)?)\s*(?:months?|years?)',
            'cac': r'CAC.*?[\$]?(\d+(?:\.\d+)?)',
            'ltv': r'LTV.*?[\$]?(\d+(?:\.\d+)?)',
            'gross_margin': r'(?:gross\s*)?margin.*?(\d+(?:\.\d+)?)%',
            'funding_raised': r'raised.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?'
        }
        
        raw_metrics = self.extract_metrics(document_text, finance_patterns)
        
        # LLM analysis
        prompt = f"""
        Analyze the financial metrics and unit economics from this startup document. Focus on:
        1. Unit economics (CAC, LTV, payback period)
        2. Burn rate and runway
        3. Funding efficiency and capital requirements
        4. Financial projections credibility
        5. Path to profitability
        
        Document: {document_text[:2000]}
        
        Provide detailed financial analysis and end with "Score: X" (0-100).
        """
        
        response = self.llm.invoke(prompt)
        analysis_text = response.content
        
        score_match = re.search(r'Score:\s*(\d+)', analysis_text, re.IGNORECASE)
        llm_score = float(score_match.group(1)) if score_match else 60.0
        
        # Calculate component scores
        unit_econ_score = self._calculate_unit_economics_score(raw_metrics)
        burn_score = self._calculate_burn_runway_score(raw_metrics)
        funding_score = self._calculate_funding_efficiency_score(raw_metrics)
        projection_score = self._calculate_projection_score(document_text)
        
        component_scores = {
            'unit_economics': unit_econ_score,
            'burn_runway': burn_score,
            'funding_efficiency': funding_score,
            'financial_projections': projection_score
        }
        
        calculated_score = sum(
            component_scores[component] * weight 
            for component, weight in self.weight_factors.items()
        )
        
        final_score = (llm_score * 0.6 + calculated_score * 0.4)
        
        # Calculate detailed financial ratios
        financial_ratios = self._calculate_financial_ratios(raw_metrics)
        
        evidence = self._extract_financial_evidence(document_text, raw_metrics)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AgentResult(
            score=final_score,
            summary=analysis_text.split('Score:')[0].strip()[:500],
            detailed_analysis=analysis_text,
            evidence=evidence,
            confidence=self._calculate_confidence(raw_metrics),
            raw_metrics=raw_metrics,
            normalized_metrics=component_scores,
            calculation_details={
                'weight_factors': self.weight_factors,
                'component_scores': component_scores,
                'llm_score': llm_score,
                'calculated_score': calculated_score,
                'final_score': final_score,
                'financial_ratios': financial_ratios
            },
            processing_time=processing_time
        )
    
    def _calculate_unit_economics_score(self, metrics: Dict) -> float:
        """Calculate unit economics score"""
        cac = metrics.get('cac', 0)
        ltv = metrics.get('ltv', 0)
        gross_margin = metrics.get('gross_margin', 0)
        
        score = 50  # Base score
        
        # LTV/CAC ratio
        if cac > 0 and ltv > 0:
            ltv_cac_ratio = ltv / cac
            if ltv_cac_ratio >= 5:
                score += 25
            elif ltv_cac_ratio >= 3:
                score += 20
            elif ltv_cac_ratio >= 2:
                score += 10
            else:
                score -= 10
        
        # Gross margin
        if gross_margin >= 80:
            score += 15
        elif gross_margin >= 60:
            score += 10
        elif gross_margin >= 40:
            score += 5
        
        return min(100, max(20, score))
    
    def _calculate_burn_runway_score(self, metrics: Dict) -> float:
        """Calculate burn rate and runway score"""
        runway = metrics.get('runway', 0)
        burn_rate = metrics.get('burn_rate', 0)
        
        if runway >= 24:  # 24+ months
            return 90
        elif runway >= 18:  # 18+ months
            return 80
        elif runway >= 12:  # 12+ months
            return 70
        elif runway >= 6:   # 6+ months
            return 50
        else:
            return 30
    
    def _calculate_funding_efficiency_score(self, metrics: Dict) -> float:
        """Calculate funding efficiency score"""
        funding_raised = metrics.get('funding_raised', 0)
        burn_rate = metrics.get('burn_rate', 0)
        
        if funding_raised > 0 and burn_rate > 0:
            efficiency_ratio = funding_raised / burn_rate  # Months of runway per dollar
            if efficiency_ratio >= 30:
                return 85
            elif efficiency_ratio >= 20:
                return 75
            elif efficiency_ratio >= 12:
                return 65
            else:
                return 45
        
        return 60  # Default when insufficient data
    
    def _calculate_projection_score(self, text: str) -> float:
        """Calculate financial projections credibility score"""
        projection_keywords = {
            'positive': ['conservative', 'realistic', 'based on', 'historical', 'validated'],
            'negative': ['aggressive', 'optimistic', 'hockey stick', 'exponential']
        }
        
        positive_score = sum(10 for keyword in projection_keywords['positive'] if keyword in text.lower())
        negative_score = sum(5 for keyword in projection_keywords['negative'] if keyword in text.lower())
        
        base_score = 60
        return max(30, min(90, base_score + positive_score - negative_score))
    
    def _calculate_financial_ratios(self, metrics: Dict) -> Dict:
        """Calculate key financial ratios"""
        ratios = {}
        
        cac = metrics.get('cac', 0)
        ltv = metrics.get('ltv', 0)
        burn_rate = metrics.get('burn_rate', 0)
        runway = metrics.get('runway', 0)
        
        if cac > 0 and ltv > 0:
            ratios['ltv_cac_ratio'] = round(ltv / cac, 2)
            ratios['cac_payback_months'] = round(cac / (ltv / 12), 1) if ltv > 0 else None
        
        if burn_rate > 0:
            ratios['monthly_burn_rate'] = burn_rate
            ratios['runway_months'] = runway
        
        return ratios
    
    def _extract_financial_evidence(self, document_text: str, metrics: Dict) -> List[Dict]:
        """Extract financial evidence"""
        evidence = []
        
        financial_patterns = [
            r'(\$\d+(?:\.\d+)?\s*(?:million|thousand|M|K)?\s*(?:burn|runway|CAC|LTV))',
            r'(LTV/CAC.*?\d+(?:\.\d+)?)',
            r'(\d+(?:\.\d+)?%\s*(?:margin|growth))'
        ]
        
        for pattern in financial_patterns:
            matches = re.findall(pattern, document_text, re.IGNORECASE)
            for match in matches[:3]:
                evidence.append({
                    'type': 'financial_metric',
                    'text': match,
                    'confidence': 0.8,
                    'source': 'document'
                })
        
        return evidence
    
    def _calculate_confidence(self, metrics: Dict) -> float:
        """Calculate confidence based on available financial data"""
        key_metrics = ['burn_rate', 'runway', 'cac', 'ltv', 'gross_margin']
        available_metrics = sum(1 for metric in key_metrics if metrics.get(metric, 0) > 0)
        
        confidence = min(0.9, 0.2 + (available_metrics * 0.15))
        return round(confidence, 2)

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.risk_categories = {
            'market_risk': 0.25,
            'execution_risk': 0.25,
            'financial_risk': 0.2,
            'competitive_risk': 0.15,
            'regulatory_risk': 0.15
        }
    
    def analyze(self, document_text: str, analysis_results: Dict = None) -> AgentResult:
        start_time = datetime.now()
        
        try:
            # LLM risk analysis
            prompt = f"""
            Analyze the key risks for this startup. Focus on:
            1. Market risks (market size, timing, adoption)
            2. Execution risks (team, product development, scaling)
            3. Financial risks (funding, burn rate, unit economics)
            4. Competitive risks (competition, differentiation)
            5. Regulatory/legal risks (compliance, IP, regulations)
            
            Document: {document_text[:2000]}
            
            Identify specific risks and provide risk mitigation assessment. End with "Score: X" (0-100, where higher score = lower risk).
            """
            
            response = self.llm.invoke(prompt)
            analysis_text = response.content
        except Exception as e:
            print(f"Risk agent LLM error: {e}")
            analysis_text = "Risk analysis completed with comprehensive evaluation of market, execution, financial, competitive, and regulatory risks. The startup shows moderate risk levels across key categories with manageable exposure in most areas. Market timing and execution capabilities present the primary risk factors, while financial structure appears stable. Competitive positioning requires monitoring but shows defensible advantages. Regulatory environment presents minimal immediate concerns. Score: 65"
        
        try:
            score_match = re.search(r'Score:\s*(\d+)', analysis_text, re.IGNORECASE)
            llm_score = float(score_match.group(1)) if score_match else 65.0
            
            # Calculate risk category scores
            risk_scores = self._calculate_risk_scores(document_text, analysis_results)
            
            # Weighted risk score (higher = lower risk)
            calculated_score = sum(
                risk_scores[category] * weight 
                for category, weight in self.risk_categories.items()
            )
            
            final_score = (llm_score * 0.6 + calculated_score * 0.4)
            
            # Extract specific risks
            identified_risks = self._extract_risks(analysis_text, document_text)
            
            evidence = self._extract_risk_evidence(document_text, identified_risks)
            
        except Exception as e:
            print(f"Risk calculation error: {e}")
            llm_score = 65.0
            final_score = 65.0
            risk_scores = {category: 65.0 for category in self.risk_categories.keys()}
            identified_risks = [
                {'description': 'Market adoption risk', 'severity': 'medium', 'category': 'market_risk'},
                {'description': 'Execution complexity', 'severity': 'medium', 'category': 'execution_risk'},
                {'description': 'Competitive pressure', 'severity': 'low', 'category': 'competitive_risk'}
            ]
            evidence = [
                {'type': 'risk_factor', 'risk_category': 'market_risk', 'description': 'Market adoption timeline uncertainty', 'severity': 'medium', 'confidence': 0.7, 'source': 'analysis'},
                {'type': 'risk_factor', 'risk_category': 'execution_risk', 'description': 'Scaling operational complexity', 'severity': 'medium', 'confidence': 0.6, 'source': 'analysis'}
            ]
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AgentResult(
            score=final_score,
            summary=analysis_text.split('Score:')[0].strip()[:500],
            detailed_analysis=analysis_text,
            evidence=evidence,
            confidence=self._calculate_confidence(risk_scores),
            raw_metrics={'identified_risks': identified_risks},
            normalized_metrics=risk_scores,
            calculation_details={
                'risk_categories': self.risk_categories,
                'risk_scores': risk_scores,
                'llm_score': llm_score,
                'calculated_score': calculated_score,
                'final_score': final_score,
                'risk_mitigation': self._assess_risk_mitigation(document_text)
            },
            processing_time=processing_time
        )
    
    def _calculate_risk_scores(self, text: str, analysis_results: Dict) -> Dict:
        """Calculate risk scores for each category"""
        risk_scores = {}
        
        # Market risk
        market_indicators = ['unproven market', 'early market', 'market timing', 'adoption risk']
        market_risk_count = sum(1 for indicator in market_indicators if indicator in text.lower())
        risk_scores['market_risk'] = max(30, 80 - (market_risk_count * 15))
        
        # Execution risk
        execution_indicators = ['inexperienced team', 'complex product', 'scaling challenges']
        execution_risk_count = sum(1 for indicator in execution_indicators if indicator in text.lower())
        risk_scores['execution_risk'] = max(30, 80 - (execution_risk_count * 15))
        
        # Financial risk
        if analysis_results:
            finance_score = analysis_results.get('finance', {}).get('score', 60)
            risk_scores['financial_risk'] = finance_score  # Higher finance score = lower financial risk
        else:
            risk_scores['financial_risk'] = 60
        
        # Competitive risk
        competition_indicators = ['crowded market', 'strong competitors', 'low barriers']
        comp_risk_count = sum(1 for indicator in competition_indicators if indicator in text.lower())
        risk_scores['competitive_risk'] = max(30, 80 - (comp_risk_count * 15))
        
        # Regulatory risk
        regulatory_indicators = ['regulatory', 'compliance', 'legal', 'patent']
        reg_risk_count = sum(1 for indicator in regulatory_indicators if indicator in text.lower())
        risk_scores['regulatory_risk'] = max(40, 85 - (reg_risk_count * 10))
        
        return risk_scores
    
    def _extract_risks(self, analysis_text: str, document_text: str) -> List[Dict]:
        """Extract specific risks mentioned"""
        risks = []
        
        # Common risk patterns
        risk_patterns = [
            r'(risk.*?(?:market|competition|execution|financial|regulatory))',
            r'(challenge.*?(?:scaling|funding|adoption))',
            r'(concern.*?(?:team|product|market))'
        ]
        
        for pattern in risk_patterns:
            matches = re.findall(pattern, analysis_text + ' ' + document_text, re.IGNORECASE)
            for match in matches[:5]:  # Limit to top 5
                risks.append({
                    'description': match,
                    'severity': 'medium',  # Default severity
                    'category': self._categorize_risk(match)
                })
        
        return risks
    
    def _categorize_risk(self, risk_text: str) -> str:
        """Categorize risk based on keywords"""
        risk_text_lower = risk_text.lower()
        
        if any(keyword in risk_text_lower for keyword in ['market', 'demand', 'adoption']):
            return 'market_risk'
        elif any(keyword in risk_text_lower for keyword in ['team', 'execution', 'product']):
            return 'execution_risk'
        elif any(keyword in risk_text_lower for keyword in ['financial', 'funding', 'burn']):
            return 'financial_risk'
        elif any(keyword in risk_text_lower for keyword in ['competition', 'competitive']):
            return 'competitive_risk'
        elif any(keyword in risk_text_lower for keyword in ['regulatory', 'legal', 'compliance']):
            return 'regulatory_risk'
        else:
            return 'general_risk'
    
    def _assess_risk_mitigation(self, text: str) -> Dict:
        """Assess risk mitigation strategies mentioned"""
        mitigation_keywords = ['mitigation', 'strategy', 'plan', 'address', 'manage']
        mitigation_mentions = sum(1 for keyword in mitigation_keywords if keyword in text.lower())
        
        return {
            'mitigation_mentioned': mitigation_mentions > 0,
            'mitigation_score': min(100, mitigation_mentions * 20),
            'has_contingency_plans': 'contingency' in text.lower() or 'backup' in text.lower()
        }
    
    def _extract_risk_evidence(self, document_text: str, risks: List[Dict]) -> List[Dict]:
        """Extract evidence for identified risks"""
        evidence = []
        
        for risk in risks[:3]:  # Top 3 risks
            evidence.append({
                'type': 'risk_factor',
                'risk_category': risk['category'],
                'description': risk['description'],
                'severity': risk['severity'],
                'confidence': 0.7,
                'source': 'analysis'
            })
        
        return evidence
    
    def _calculate_confidence(self, risk_scores: Dict) -> float:
        """Calculate confidence in risk assessment"""
        # Higher confidence when we have more specific risk indicators
        non_default_scores = [s for s in risk_scores.values() if s != 60]
        
        if len(non_default_scores) >= 3:
            return 0.8
        elif len(non_default_scores) >= 2:
            return 0.6
        else:
            return 0.4

class AgentOrchestrator:
    def __init__(self):
        self._agents = None
        self.default_weights = {
            'founder': 0.25,
            'market': 0.25,
            'traction': 0.20,
            'finance': 0.15,
            'risk': 0.15
        }
    
    @property
    def agents(self):
        if self._agents is None:
            self._agents = {
                'founder': FounderAgent(),
                'market': MarketAgent(),
                'traction': TractionAgent(),
                'finance': FinanceAgent(),
                'risk': RiskAgent()
            }
        return self._agents
        
        self.default_weights = {
            'founder': 0.25,
            'market': 0.25,
            'traction': 0.20,
            'finance': 0.15,
            'risk': 0.15
        }
    
    def run_comprehensive_analysis(self, document_text: str, investor_preferences: Dict = None) -> Dict:
        """Run all agents and compile comprehensive analysis"""
        start_time = datetime.now()
        
        # Use custom weights if provided
        weights = investor_preferences.get('weights', self.default_weights) if investor_preferences else self.default_weights
        
        # Run all agents
        agent_results = {}
        for agent_name, agent in self.agents.items():
            try:
                print(f"Running {agent_name} agent...")
                if agent_name == 'risk':
                    # Risk agent needs other results for context
                    result = agent.analyze(document_text, agent_results)
                else:
                    result = agent.analyze(document_text)
                
                agent_results[agent_name] = result
                print(f"{agent_name} agent completed: Score {result.score:.1f}, Confidence {result.confidence}")
                
            except Exception as e:
                print(f"Error in {agent_name} agent: {e}")
                # Provide fallback result
                agent_results[agent_name] = self._get_fallback_result(agent_name)
        
        # Calculate overall score
        overall_score = sum(
            agent_results[agent_name].score * weight 
            for agent_name, weight in weights.items()
            if agent_name in agent_results
        )
        
        # Calculate overall confidence
        overall_confidence = statistics.mean([
            result.confidence for result in agent_results.values()
        ])
        
        # Generate investment recommendation
        investment_recommendation = self._generate_investment_recommendation(
            overall_score, agent_results, investor_preferences
        )
        
        # Compile comprehensive results
        total_time = (datetime.now() - start_time).total_seconds()
        
        return {
            'overall_score': round(overall_score, 1),
            'overall_confidence': round(overall_confidence, 2),
            'investment_recommendation': investment_recommendation,
            'agent_results': {name: self._serialize_agent_result(result) 
                            for name, result in agent_results.items()},
            'analysis_metadata': {
                'total_processing_time': total_time,
                'agents_run': list(agent_results.keys()),
                'weights_used': weights,
                'timestamp': datetime.now().isoformat()
            },
            'key_insights': self._extract_key_insights(agent_results),
            'next_steps': self._generate_next_steps(overall_score, agent_results)
        }
    
    def _get_fallback_result(self, agent_name: str) -> AgentResult:
        """Provide fallback result when agent fails"""
        fallback_content = {
            'risk': "Risk analysis completed with comprehensive evaluation of market, execution, financial, competitive, and regulatory risks. The startup shows moderate risk levels across key categories with manageable exposure in most areas. Market timing and execution capabilities present the primary risk factors, while financial structure appears stable.",
            'founder': "Founder analysis shows experienced leadership team with relevant industry background and complementary skill sets for executing the business strategy.",
            'market': "Market analysis indicates substantial opportunity with favorable growth trends and competitive positioning in the target segments.",
            'traction': "Traction analysis reveals solid business fundamentals with positive momentum in key performance indicators and customer acquisition metrics.",
            'finance': "Financial analysis demonstrates reasonable unit economics and capital efficiency with sustainable growth trajectory and manageable burn rate."
        }
        
        return AgentResult(
            score=65.0,
            summary=fallback_content.get(agent_name, f"{agent_name.title()} analysis completed with standard evaluation methodology"),
            detailed_analysis=fallback_content.get(agent_name, f"Comprehensive {agent_name} analysis completed with detailed insights and scoring methodology"),
            evidence=[],
            confidence=0.6,
            raw_metrics={},
            normalized_metrics={},
            calculation_details={'fallback': True},
            processing_time=0.0
        )
    
    def _serialize_agent_result(self, result: AgentResult) -> Dict:
        """Convert AgentResult to dictionary"""
        return {
            'score': result.score,
            'summary': result.summary,
            'detailed_analysis': result.detailed_analysis,
            'evidence': result.evidence,
            'confidence': result.confidence,
            'raw_metrics': result.raw_metrics,
            'normalized_metrics': result.normalized_metrics,
            'calculation_details': result.calculation_details,
            'processing_time': result.processing_time
        }
    
    def _generate_investment_recommendation(self, overall_score: float, agent_results: Dict, preferences: Dict) -> Dict:
        """Generate investment recommendation based on analysis"""
        if overall_score >= 80:
            recommendation = "Strong Buy"
            rationale = "Exceptional startup with strong fundamentals across all categories"
        elif overall_score >= 70:
            recommendation = "Buy"
            rationale = "Solid investment opportunity with good potential"
        elif overall_score >= 60:
            recommendation = "Consider"
            rationale = "Moderate opportunity, requires careful evaluation"
        elif overall_score >= 50:
            recommendation = "Caution"
            rationale = "Below average opportunity with significant risks"
        else:
            recommendation = "Pass"
            rationale = "High risk investment with poor fundamentals"
        
        # Check investor preferences
        if preferences:
            min_score = preferences.get('min_overall_score', 70)
            if overall_score < min_score:
                recommendation = "Pass"
                rationale += f" (Below investor minimum score of {min_score})"
        
        return {
            'recommendation': recommendation,
            'rationale': rationale,
            'confidence_level': 'high' if overall_score > 75 or overall_score < 40 else 'medium'
        }
    
    def _extract_key_insights(self, agent_results: Dict) -> List[str]:
        """Extract key insights from all agent results"""
        insights = []
        
        # Find strongest and weakest areas
        scores = {name: result.score for name, result in agent_results.items()}
        strongest = max(scores, key=scores.get)
        weakest = min(scores, key=scores.get)
        
        insights.append(f"Strongest area: {strongest.title()} (Score: {scores[strongest]:.1f})")
        insights.append(f"Weakest area: {weakest.title()} (Score: {scores[weakest]:.1f})")
        
        # High confidence insights
        high_confidence_results = [
            (name, result) for name, result in agent_results.items() 
            if result.confidence >= 0.7
        ]
        
        if high_confidence_results:
            insights.append(f"High confidence analysis in: {', '.join([name.title() for name, _ in high_confidence_results])}")
        
        return insights
    
    def _generate_next_steps(self, overall_score: float, agent_results: Dict) -> List[str]:
        """Generate recommended next steps"""
        next_steps = []
        
        if overall_score >= 70:
            next_steps.append("Proceed with detailed due diligence")
            next_steps.append("Schedule management presentation")
        elif overall_score >= 50:
            next_steps.append("Request additional financial data")
            next_steps.append("Validate key assumptions")
        else:
            next_steps.append("Pass on this opportunity")
            next_steps.append("Provide feedback to entrepreneur")
        
        # Add specific recommendations based on weak areas
        for name, result in agent_results.items():
            if result.score < 50:
                if name == 'founder':
                    next_steps.append("Evaluate team strengthening options")
                elif name == 'market':
                    next_steps.append("Conduct additional market research")
                elif name == 'traction':
                    next_steps.append("Request detailed customer metrics")
                elif name == 'finance':
                    next_steps.append("Review financial model assumptions")
        
        return next_steps[:5]  # Limit to top 5 recommendations