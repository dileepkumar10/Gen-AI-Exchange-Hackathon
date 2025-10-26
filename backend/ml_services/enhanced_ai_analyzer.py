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
        
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
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