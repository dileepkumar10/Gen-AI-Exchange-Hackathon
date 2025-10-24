import os
import json
import re
from typing import Dict, List, Tuple
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import statistics

load_dotenv()

class EnhancedAIAnalyzer:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("LLM_MODEL_NAME", "llama-3.1-8b-instant")
        
        # Initialize multiple models for ensemble
        self.models = {
            'primary': ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model_name, temperature=0.1),
            'secondary': ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model_name, temperature=0.3),
            'validator': ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model_name, temperature=0.0)
        }
        
        self.confidence_thresholds = {
            'high': 0.8,
            'medium': 0.6,
            'low': 0.4
        }
    
    def analyze_with_confidence(self, prompt: str, data: str, analysis_type: str) -> Dict:
        """Analyze with confidence scoring using ensemble approach"""
        
        # Get multiple predictions
        predictions = []
        for model_name, model in self.models.items():
            try:
                response = model.invoke(f"{prompt}\n\nData: {data}")
                score, text = self.extract_score_and_text(response.content)
                predictions.append({
                    'model': model_name,
                    'score': score,
                    'text': text,
                    'raw_response': response.content
                })
            except Exception as e:
                print(f"Error with {model_name}: {e}")
                continue
        
        if not predictions:
            return self.get_fallback_response(analysis_type)
        
        # Calculate consensus and confidence
        consensus_result = self.calculate_consensus(predictions)
        confidence_score = self.calculate_confidence(predictions)
        
        return {
            'score': consensus_result['score'],
            'text': consensus_result['text'],
            'confidence': confidence_score,
            'confidence_level': self.get_confidence_level(confidence_score),
            'model_agreement': len(predictions),
            'individual_predictions': predictions,
            'analysis_type': analysis_type
        }
    
    def calculate_consensus(self, predictions: List[Dict]) -> Dict:
        """Calculate consensus from multiple model predictions"""
        scores = [p['score'] for p in predictions if p['score'] > 0]
        
        if not scores:
            return {'score': 50, 'text': 'Unable to generate reliable analysis'}
        
        # Use median for robust consensus
        consensus_score = int(statistics.median(scores))
        
        # Select best text (from model with score closest to consensus)
        best_prediction = min(predictions, key=lambda p: abs(p['score'] - consensus_score))
        
        return {
            'score': consensus_score,
            'text': best_prediction['text']
        }
    
    def calculate_confidence(self, predictions: List[Dict]) -> float:
        """Calculate confidence based on model agreement"""
        if len(predictions) < 2:
            return 0.5
        
        scores = [p['score'] for p in predictions if p['score'] > 0]
        
        if not scores:
            return 0.3
        
        # Calculate standard deviation (lower = higher confidence)
        std_dev = statistics.stdev(scores) if len(scores) > 1 else 0
        
        # Normalize confidence (0-1 scale)
        # Lower std_dev = higher confidence
        max_std = 30  # Maximum expected standard deviation
        confidence = max(0.1, 1 - (std_dev / max_std))
        
        return round(confidence, 2)
    
    def get_confidence_level(self, confidence_score: float) -> str:
        """Convert confidence score to level"""
        if confidence_score >= self.confidence_thresholds['high']:
            return 'high'
        elif confidence_score >= self.confidence_thresholds['medium']:
            return 'medium'
        else:
            return 'low'
    
    def extract_score_and_text(self, response: str) -> Tuple[int, str]:
        """Extract score and text from AI response"""
        # Find score
        score_patterns = [
            r'Score:\s*(\d+)',
            r'Rating:\s*(\d+)',
            r'(\d+)/100',
            r'(\d+)%'
        ]
        
        score = 0
        for pattern in score_patterns:
            match = re.search(pattern, response, re.IGNORECASE)
            if match:
                score = int(match.group(1))
                score = max(0, min(100, score))  # Clamp to 0-100
                break
        
        # Extract text (everything before score)
        score_index = response.lower().find('score:')
        if score_index > 0:
            text = response[:score_index].strip()
        else:
            text = response.strip()
        
        return score, text
    
    def get_fallback_response(self, analysis_type: str) -> Dict:
        """Provide fallback response when AI fails"""
        fallback_responses = {
            'founders_profile': {
                'score': 60,
                'text': 'Unable to analyze founder profile from provided data. Manual review recommended.',
                'confidence': 0.2
            },
            'market_problem': {
                'score': 55,
                'text': 'Market analysis requires additional data. Consider providing more market research.',
                'confidence': 0.2
            },
            'unique_differentiator': {
                'score': 50,
                'text': 'Competitive advantage analysis inconclusive. Further investigation needed.',
                'confidence': 0.2
            },
            'business_metrics': {
                'score': 45,
                'text': 'Financial metrics analysis incomplete. Additional financial data required.',
                'confidence': 0.2
            }
        }
        
        fallback = fallback_responses.get(analysis_type, {
            'score': 50,
            'text': 'Analysis could not be completed reliably.',
            'confidence': 0.2
        })
        
        return {
            **fallback,
            'confidence_level': 'low',
            'model_agreement': 0,
            'analysis_type': analysis_type,
            'is_fallback': True
        }
    
    def validate_analysis(self, analysis_result: Dict) -> Dict:
        """Validate analysis result for quality"""
        validation_checks = {
            'score_range': 0 <= analysis_result['score'] <= 100,
            'text_length': len(analysis_result['text']) > 50,
            'confidence_valid': 0 <= analysis_result['confidence'] <= 1,
            'has_content': bool(analysis_result['text'].strip())
        }
        
        validation_score = sum(validation_checks.values()) / len(validation_checks)
        
        return {
            **analysis_result,
            'validation': {
                'checks': validation_checks,
                'score': validation_score,
                'is_valid': validation_score >= 0.75
            }
        }
    
    def get_analysis_insights(self, analysis_result: Dict) -> Dict:
        """Generate insights about the analysis quality"""
        insights = []
        
        confidence = analysis_result['confidence']
        confidence_level = analysis_result['confidence_level']
        
        if confidence_level == 'high':
            insights.append("High confidence analysis - results are reliable")
        elif confidence_level == 'medium':
            insights.append("Moderate confidence - consider additional validation")
        else:
            insights.append("Low confidence - manual review strongly recommended")
        
        if analysis_result.get('model_agreement', 0) < 2:
            insights.append("Limited model consensus - single model prediction")
        
        if analysis_result.get('is_fallback'):
            insights.append("Fallback response used - AI analysis failed")
        
        return {
            'insights': insights,
            'recommendation': self.get_recommendation(confidence_level),
            'next_steps': self.get_next_steps(confidence_level)
        }
    
    def get_recommendation(self, confidence_level: str) -> str:
        """Get recommendation based on confidence level"""
        recommendations = {
            'high': 'Proceed with analysis results',
            'medium': 'Consider additional validation',
            'low': 'Manual review required before proceeding'
        }
        return recommendations.get(confidence_level, 'Review required')
    
    def get_next_steps(self, confidence_level: str) -> List[str]:
        """Get next steps based on confidence level"""
        next_steps = {
            'high': [
                'Use results for investment decision',
                'Generate final report'
            ],
            'medium': [
                'Validate key findings',
                'Gather additional data if needed',
                'Consider expert review'
            ],
            'low': [
                'Manual analysis required',
                'Gather more comprehensive data',
                'Expert consultation recommended'
            ]
        }
        return next_steps.get(confidence_level, ['Review and validate'])

class PredictiveAnalytics:
    def __init__(self):
        self.success_factors = {
            'team_score': 0.3,
            'market_score': 0.25,
            'product_score': 0.25,
            'traction_score': 0.2
        }
    
    def predict_success_probability(self, analysis_results: Dict) -> Dict:
        """Predict startup success probability"""
        
        # Extract scores
        team_score = analysis_results.get('founders_profile', {}).get('score', 50)
        market_score = analysis_results.get('market_problem', {}).get('score', 50)
        product_score = analysis_results.get('unique_differentiator', {}).get('score', 50)
        traction_score = analysis_results.get('business_metrics', {}).get('score', 50)
        
        # Calculate weighted success probability
        success_prob = (
            team_score * self.success_factors['team_score'] +
            market_score * self.success_factors['market_score'] +
            product_score * self.success_factors['product_score'] +
            traction_score * self.success_factors['traction_score']
        ) / 100
        
        return {
            'success_probability': round(success_prob, 2),
            'success_percentage': f"{round(success_prob * 100)}%",
            'key_strengths': self.identify_strengths(analysis_results),
            'key_risks': self.identify_risks(analysis_results),
            'comparable_success_rate': self.get_comparable_success_rate(success_prob),
            'investment_recommendation': self.get_investment_recommendation(success_prob)
        }
    
    def identify_strengths(self, analysis_results: Dict) -> List[str]:
        """Identify key strengths from analysis"""
        strengths = []
        
        for category, data in analysis_results.items():
            if isinstance(data, dict) and data.get('score', 0) >= 75:
                category_name = category.replace('_', ' ').title()
                strengths.append(f"Strong {category_name}")
        
        return strengths
    
    def identify_risks(self, analysis_results: Dict) -> List[str]:
        """Identify key risks from analysis"""
        risks = []
        
        for category, data in analysis_results.items():
            if isinstance(data, dict) and data.get('score', 0) <= 40:
                category_name = category.replace('_', ' ').title()
                risks.append(f"Weak {category_name}")
        
        return risks
    
    def get_comparable_success_rate(self, success_prob: float) -> str:
        """Get comparable success rate description"""
        if success_prob >= 0.8:
            return "Top 10% of startups"
        elif success_prob >= 0.6:
            return "Above average startup"
        elif success_prob >= 0.4:
            return "Average startup"
        else:
            return "Below average startup"
    
    def get_investment_recommendation(self, success_prob: float) -> str:
        """Get investment recommendation"""
        if success_prob >= 0.75:
            return "Strong Investment Opportunity"
        elif success_prob >= 0.6:
            return "Consider Investment"
        elif success_prob >= 0.4:
            return "Proceed with Caution"
        else:
            return "High Risk Investment"