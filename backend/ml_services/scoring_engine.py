import numpy as np
import statistics
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json
from datetime import datetime

@dataclass
class ScoringConfig:
    """Configuration for scoring algorithms"""
    normalization_method: str = "min_max"  # min_max, z_score, log_scale
    confidence_threshold: float = 0.6
    outlier_threshold: float = 2.0  # Z-score threshold
    weights: Dict[str, float] = None

class ScoringEngine:
    """Advanced scoring engine with multiple normalization methods and benchmarking"""
    
    def __init__(self, config: ScoringConfig = None):
        self.config = config or ScoringConfig()
        self.cohort_stats = {}  # Will be loaded from database
        
        # Default reference values for normalization
        self.reference_values = {
            'founder': {
                'experience_years': {'min': 0, 'max': 20, 'mean': 8, 'std': 5},
                'previous_exits': {'min': 0, 'max': 3, 'mean': 0.5, 'std': 0.8},
                'team_size': {'min': 1, 'max': 10, 'mean': 3, 'std': 2}
            },
            'market': {
                'tam_billions': {'min': 0.1, 'max': 1000, 'mean': 50, 'std': 100},
                'growth_rate': {'min': 0, 'max': 50, 'mean': 15, 'std': 10},
                'competition_density': {'min': 1, 'max': 100, 'mean': 20, 'std': 15}
            },
            'traction': {
                'arr_millions': {'min': 0, 'max': 100, 'mean': 2, 'std': 5},
                'growth_rate': {'min': 0, 'max': 200, 'mean': 50, 'std': 40},
                'customers': {'min': 0, 'max': 100000, 'mean': 1000, 'std': 5000}
            },
            'finance': {
                'ltv_cac_ratio': {'min': 0, 'max': 10, 'mean': 3, 'std': 2},
                'runway_months': {'min': 0, 'max': 60, 'mean': 18, 'std': 12},
                'gross_margin': {'min': 0, 'max': 100, 'mean': 70, 'std': 20}
            }
        }
    
    def normalize_score(self, value: float, metric_name: str, category: str, method: str = None) -> float:
        """Normalize a single score using specified method"""
        method = method or self.config.normalization_method
        
        if category not in self.reference_values or metric_name not in self.reference_values[category]:
            # Fallback to simple 0-100 clipping
            return max(0, min(100, value))
        
        ref = self.reference_values[category][metric_name]
        
        if method == "min_max":
            return self._min_max_normalize(value, ref['min'], ref['max'])
        elif method == "z_score":
            return self._z_score_normalize(value, ref['mean'], ref['std'])
        elif method == "log_scale":
            return self._log_normalize(value, ref['max'])
        else:
            raise ValueError(f"Unknown normalization method: {method}")
    
    def _min_max_normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Min-max normalization to 0-100 scale"""
        if max_val == min_val:
            return 50.0
        normalized = ((value - min_val) / (max_val - min_val)) * 100
        return max(0, min(100, normalized))
    
    def _z_score_normalize(self, value: float, mean: float, std: float) -> float:
        """Z-score normalization converted to percentile (0-100)"""
        if std == 0:
            return 50.0
        
        z_score = (value - mean) / std
        # Convert z-score to percentile using normal CDF approximation
        percentile = self._z_to_percentile(z_score)
        return max(0, min(100, percentile * 100))
    
    def _log_normalize(self, value: float, max_ref: float) -> float:
        """Log normalization for skewed data"""
        if value <= 0:
            return 0
        
        log_value = np.log(1 + value)
        log_max = np.log(1 + max_ref)
        
        if log_max == 0:
            return 50.0
        
        normalized = (log_value / log_max) * 100
        return max(0, min(100, normalized))
    
    def _z_to_percentile(self, z: float) -> float:
        """Convert z-score to percentile using normal CDF approximation"""
        # Simple approximation of normal CDF
        if z < -3:
            return 0.001
        elif z > 3:
            return 0.999
        else:
            # Using error function approximation
            return 0.5 * (1 + np.tanh(z * np.sqrt(2/np.pi)))
    
    def calculate_composite_score(self, category_scores: Dict[str, float], weights: Dict[str, float] = None) -> Dict:
        """Calculate weighted composite score with confidence metrics"""
        if not weights:
            weights = self.config.weights or {
                'founder': 0.25,
                'market': 0.25,
                'traction': 0.20,
                'finance': 0.15,
                'risk': 0.15
            }
        
        # Ensure weights sum to 1
        total_weight = sum(weights.values())
        if total_weight != 1.0:
            weights = {k: v/total_weight for k, v in weights.items()}
        
        # Calculate weighted score
        weighted_sum = 0
        total_weight_used = 0
        
        for category, score in category_scores.items():
            if category in weights and score is not None:
                weighted_sum += score * weights[category]
                total_weight_used += weights[category]
        
        if total_weight_used == 0:
            return {'composite_score': 50.0, 'confidence': 0.1, 'coverage': 0.0}
        
        composite_score = weighted_sum / total_weight_used
        
        # Calculate confidence based on score consistency and coverage
        confidence = self._calculate_composite_confidence(category_scores, weights)
        coverage = total_weight_used  # Percentage of weights covered
        
        return {
            'composite_score': round(composite_score, 1),
            'confidence': round(confidence, 2),
            'coverage': round(coverage, 2),
            'weights_used': {k: v for k, v in weights.items() if k in category_scores}
        }
    
    def _calculate_composite_confidence(self, scores: Dict[str, float], weights: Dict[str, float]) -> float:
        """Calculate confidence in composite score"""
        valid_scores = [score for score in scores.values() if score is not None]
        
        if len(valid_scores) < 2:
            return 0.3  # Low confidence with insufficient data
        
        # Score consistency (lower std dev = higher confidence)
        std_dev = statistics.stdev(valid_scores)
        consistency_factor = max(0, 1 - (std_dev / 40))  # Normalize by expected max std dev
        
        # Coverage factor (more categories = higher confidence)
        coverage_factor = len(valid_scores) / len(weights)
        
        # Combined confidence
        confidence = 0.4 * consistency_factor + 0.6 * coverage_factor
        return max(0.1, min(0.95, confidence))
    
    def detect_outliers(self, scores: Dict[str, float]) -> Dict[str, bool]:
        """Detect outlier scores using z-score method"""
        outliers = {}
        valid_scores = [score for score in scores.values() if score is not None]
        
        if len(valid_scores) < 3:
            return {category: False for category in scores.keys()}
        
        mean_score = statistics.mean(valid_scores)
        std_score = statistics.stdev(valid_scores)
        
        for category, score in scores.items():
            if score is not None and std_score > 0:
                z_score = abs(score - mean_score) / std_score
                outliers[category] = z_score > self.config.outlier_threshold
            else:
                outliers[category] = False
        
        return outliers
    
    def benchmark_against_cohort(self, scores: Dict[str, float], vertical: str, stage: str) -> Dict:
        """Benchmark scores against cohort statistics"""
        cohort_key = f"{vertical}_{stage}"
        
        if cohort_key not in self.cohort_stats:
            return self._generate_default_benchmarks(scores)
        
        cohort_data = self.cohort_stats[cohort_key]
        benchmarks = {}
        
        for category, score in scores.items():
            if score is not None and category in cohort_data:
                cohort_stats = cohort_data[category]
                
                # Calculate percentile rank
                percentile = self._calculate_percentile_rank(score, cohort_stats)
                
                # Determine performance level
                if percentile >= 90:
                    performance = "Exceptional"
                elif percentile >= 75:
                    performance = "Above Average"
                elif percentile >= 50:
                    performance = "Average"
                elif percentile >= 25:
                    performance = "Below Average"
                else:
                    performance = "Poor"
                
                benchmarks[category] = {
                    'score': score,
                    'percentile': round(percentile, 1),
                    'performance': performance,
                    'cohort_median': cohort_stats.get('median', 50),
                    'cohort_mean': cohort_stats.get('mean', 50),
                    'sample_size': cohort_stats.get('sample_count', 0)
                }
        
        return benchmarks
    
    def _calculate_percentile_rank(self, score: float, cohort_stats: Dict) -> float:
        """Calculate percentile rank within cohort"""
        mean = cohort_stats.get('mean', 50)
        std = cohort_stats.get('std_dev', 15)
        
        if std == 0:
            return 50.0
        
        z_score = (score - mean) / std
        percentile = self._z_to_percentile(z_score) * 100
        
        return max(0, min(100, percentile))
    
    def _generate_default_benchmarks(self, scores: Dict[str, float]) -> Dict:
        """Generate default benchmarks when cohort data unavailable"""
        benchmarks = {}
        
        for category, score in scores.items():
            if score is not None:
                # Simple performance classification
                if score >= 80:
                    performance = "Above Average"
                elif score >= 60:
                    performance = "Average"
                else:
                    performance = "Below Average"
                
                benchmarks[category] = {
                    'score': score,
                    'percentile': min(100, max(0, score)),  # Approximate percentile
                    'performance': performance,
                    'cohort_median': 50,
                    'cohort_mean': 50,
                    'sample_size': 0
                }
        
        return benchmarks
    
    def calculate_success_probability(self, category_scores: Dict[str, float], weights: Dict[str, float] = None) -> Dict:
        """Calculate startup success probability using logistic regression model"""
        
        # Simplified success probability model
        # In production, this would use trained ML model
        
        composite_result = self.calculate_composite_score(category_scores, weights)
        composite_score = composite_result['composite_score']
        
        # Logistic function to convert score to probability
        # P(success) = 1 / (1 + e^(-k*(score - threshold)))
        k = 0.1  # Steepness parameter
        threshold = 60  # Score threshold for 50% probability
        
        logit = k * (composite_score - threshold)
        probability = 1 / (1 + np.exp(-logit))
        
        # Adjust based on confidence
        confidence_adjustment = composite_result['confidence']
        adjusted_probability = probability * confidence_adjustment + 0.1 * (1 - confidence_adjustment)
        
        # Success categories
        if adjusted_probability >= 0.8:
            success_category = "Very High"
        elif adjusted_probability >= 0.6:
            success_category = "High"
        elif adjusted_probability >= 0.4:
            success_category = "Moderate"
        elif adjusted_probability >= 0.2:
            success_category = "Low"
        else:
            success_category = "Very Low"
        
        return {
            'success_probability': round(adjusted_probability, 3),
            'success_percentage': f"{round(adjusted_probability * 100, 1)}%",
            'success_category': success_category,
            'confidence': composite_result['confidence'],
            'model_inputs': {
                'composite_score': composite_score,
                'category_scores': category_scores,
                'weights': weights or {}
            }
        }
    
    def generate_score_explanation(self, category_scores: Dict[str, float], weights: Dict[str, float] = None) -> Dict:
        """Generate detailed explanation of scoring methodology"""
        
        composite_result = self.calculate_composite_score(category_scores, weights)
        outliers = self.detect_outliers(category_scores)
        
        explanations = []
        
        # Overall score explanation
        explanations.append(f"Overall score of {composite_result['composite_score']} calculated using weighted average")
        
        # Category contributions
        used_weights = composite_result['weights_used']
        for category, score in category_scores.items():
            if category in used_weights and score is not None:
                weight = used_weights[category]
                contribution = score * weight
                explanations.append(f"{category.title()}: {score:.1f} (weight: {weight:.1%}) → contributes {contribution:.1f} points")
        
        # Outlier detection
        outlier_categories = [cat for cat, is_outlier in outliers.items() if is_outlier]
        if outlier_categories:
            explanations.append(f"Outlier scores detected in: {', '.join(outlier_categories)}")
        
        # Confidence explanation
        confidence_level = "high" if composite_result['confidence'] >= 0.7 else "medium" if composite_result['confidence'] >= 0.4 else "low"
        explanations.append(f"Analysis confidence: {confidence_level} ({composite_result['confidence']:.2f})")
        
        return {
            'explanations': explanations,
            'methodology': {
                'normalization_method': self.config.normalization_method,
                'weighting_scheme': 'investor_preferences' if weights else 'default',
                'confidence_calculation': 'score_consistency + category_coverage',
                'outlier_detection': f'z-score > {self.config.outlier_threshold}'
            },
            'score_breakdown': {
                'category_scores': category_scores,
                'weights': used_weights,
                'composite_score': composite_result['composite_score'],
                'confidence': composite_result['confidence']
            }
        }

class FinancialCalculator:
    """Specialized calculator for financial metrics and unit economics"""
    
    @staticmethod
    def calculate_unit_economics(metrics: Dict[str, float]) -> Dict:
        """Calculate comprehensive unit economics"""
        results = {}
        
        # Basic metrics
        arr = metrics.get('arr', 0)
        mrr = metrics.get('mrr', 0)
        customers = metrics.get('customers', 0)
        cac = metrics.get('cac', 0)
        ltv = metrics.get('ltv', 0)
        churn_rate = metrics.get('churn_rate', 0)
        gross_margin = metrics.get('gross_margin', 0)
        
        # Calculate derived metrics
        if mrr > 0 and arr == 0:
            results['arr'] = mrr * 12
        elif arr > 0 and mrr == 0:
            results['mrr'] = arr / 12
        
        # ARPU calculation
        if (arr > 0 or mrr > 0) and customers > 0:
            annual_revenue = arr if arr > 0 else mrr * 12
            results['arpu_annual'] = annual_revenue / customers
            results['arpu_monthly'] = results['arpu_annual'] / 12
        
        # LTV calculation (if not provided)
        if ltv == 0 and 'arpu_monthly' in results and churn_rate > 0:
            monthly_churn = churn_rate / 100
            if monthly_churn < 1:  # Sanity check
                results['calculated_ltv'] = (results['arpu_monthly'] * gross_margin / 100) / monthly_churn
        
        # LTV/CAC ratio
        if (ltv > 0 or 'calculated_ltv' in results) and cac > 0:
            ltv_value = ltv if ltv > 0 else results.get('calculated_ltv', 0)
            results['ltv_cac_ratio'] = ltv_value / cac
        
        # Payback period
        if cac > 0 and 'arpu_monthly' in results and gross_margin > 0:
            monthly_gross_revenue = results['arpu_monthly'] * gross_margin / 100
            if monthly_gross_revenue > 0:
                results['payback_months'] = cac / monthly_gross_revenue
        
        # Health scores
        results['unit_economics_health'] = FinancialCalculator._assess_unit_economics_health(results)
        
        return results
    
    @staticmethod
    def _assess_unit_economics_health(metrics: Dict) -> Dict:
        """Assess health of unit economics"""
        health_score = 50  # Base score
        issues = []
        strengths = []
        
        # LTV/CAC ratio assessment
        ltv_cac = metrics.get('ltv_cac_ratio', 0)
        if ltv_cac >= 5:
            health_score += 20
            strengths.append("Excellent LTV/CAC ratio (≥5)")
        elif ltv_cac >= 3:
            health_score += 15
            strengths.append("Good LTV/CAC ratio (≥3)")
        elif ltv_cac >= 1:
            health_score += 5
            strengths.append("Acceptable LTV/CAC ratio (≥1)")
        elif ltv_cac > 0:
            health_score -= 10
            issues.append("Poor LTV/CAC ratio (<1)")
        
        # Payback period assessment
        payback = metrics.get('payback_months', 0)
        if 0 < payback <= 12:
            health_score += 15
            strengths.append("Good payback period (≤12 months)")
        elif 12 < payback <= 24:
            health_score += 5
            strengths.append("Acceptable payback period (≤24 months)")
        elif payback > 24:
            health_score -= 10
            issues.append("Long payback period (>24 months)")
        
        return {
            'health_score': max(0, min(100, health_score)),
            'strengths': strengths,
            'issues': issues,
            'overall_assessment': 'Healthy' if health_score >= 70 else 'Concerning' if health_score >= 40 else 'Poor'
        }
    
    @staticmethod
    def calculate_burn_runway(metrics: Dict[str, float]) -> Dict:
        """Calculate burn rate and runway metrics"""
        results = {}
        
        monthly_burn = metrics.get('monthly_burn', 0)
        cash_balance = metrics.get('cash_balance', 0)
        monthly_revenue = metrics.get('monthly_revenue', 0)
        
        # Runway calculation
        if monthly_burn > 0 and cash_balance > 0:
            results['runway_months'] = cash_balance / monthly_burn
            results['runway_years'] = results['runway_months'] / 12
        
        # Net burn (burn - revenue)
        if monthly_burn > 0 and monthly_revenue > 0:
            results['net_burn'] = monthly_burn - monthly_revenue
            if results['net_burn'] > 0 and cash_balance > 0:
                results['net_runway_months'] = cash_balance / results['net_burn']
        
        # Burn efficiency
        if monthly_burn > 0 and monthly_revenue > 0:
            results['burn_multiple'] = monthly_burn / monthly_revenue
        
        # Runway health assessment
        runway_months = results.get('runway_months', 0)
        if runway_months >= 24:
            results['runway_health'] = 'Excellent'
        elif runway_months >= 18:
            results['runway_health'] = 'Good'
        elif runway_months >= 12:
            results['runway_health'] = 'Adequate'
        elif runway_months >= 6:
            results['runway_health'] = 'Concerning'
        else:
            results['runway_health'] = 'Critical'
        
        return results

class BenchmarkingEngine:
    """Engine for comparing startups against industry benchmarks"""
    
    def __init__(self):
        # Industry benchmark data (would be loaded from database in production)
        self.industry_benchmarks = {
            'saas': {
                'seed': {
                    'arr': {'p25': 0.05, 'p50': 0.1, 'p75': 0.5, 'p90': 1.0},
                    'growth_rate': {'p25': 50, 'p50': 100, 'p75': 200, 'p90': 400},
                    'ltv_cac': {'p25': 2, 'p50': 3, 'p75': 5, 'p90': 8}
                },
                'series_a': {
                    'arr': {'p25': 1, 'p50': 2, 'p75': 5, 'p90': 10},
                    'growth_rate': {'p25': 100, 'p50': 150, 'p75': 250, 'p90': 400},
                    'ltv_cac': {'p25': 3, 'p50': 4, 'p75': 6, 'p90': 10}
                }
            },
            'fintech': {
                'seed': {
                    'arr': {'p25': 0.1, 'p50': 0.3, 'p75': 1.0, 'p90': 3.0},
                    'growth_rate': {'p25': 30, 'p50': 80, 'p75': 150, 'p90': 300}
                }
            }
        }
    
    def compare_to_benchmarks(self, metrics: Dict[str, float], industry: str, stage: str) -> Dict:
        """Compare startup metrics to industry benchmarks"""
        
        if industry not in self.industry_benchmarks:
            return {'error': f'No benchmarks available for industry: {industry}'}
        
        if stage not in self.industry_benchmarks[industry]:
            return {'error': f'No benchmarks available for stage: {stage} in {industry}'}
        
        benchmarks = self.industry_benchmarks[industry][stage]
        comparisons = {}
        
        for metric, value in metrics.items():
            if metric in benchmarks and value is not None:
                benchmark_data = benchmarks[metric]
                
                # Determine percentile
                percentile = self._calculate_percentile(value, benchmark_data)
                
                # Performance assessment
                if percentile >= 90:
                    performance = 'Top 10%'
                elif percentile >= 75:
                    performance = 'Top 25%'
                elif percentile >= 50:
                    performance = 'Above Median'
                elif percentile >= 25:
                    performance = 'Below Median'
                else:
                    performance = 'Bottom 25%'
                
                comparisons[metric] = {
                    'value': value,
                    'percentile': percentile,
                    'performance': performance,
                    'benchmark_median': benchmark_data['p50'],
                    'benchmark_p75': benchmark_data['p75'],
                    'benchmark_p90': benchmark_data['p90']
                }
        
        return {
            'industry': industry,
            'stage': stage,
            'comparisons': comparisons,
            'overall_performance': self._assess_overall_performance(comparisons)
        }
    
    def _calculate_percentile(self, value: float, benchmark_data: Dict) -> float:
        """Calculate percentile rank against benchmarks"""
        p25, p50, p75, p90 = benchmark_data['p25'], benchmark_data['p50'], benchmark_data['p75'], benchmark_data['p90']
        
        if value >= p90:
            return 90 + (value - p90) / (p90 * 0.1) * 10  # Extrapolate above p90
        elif value >= p75:
            return 75 + (value - p75) / (p90 - p75) * 15
        elif value >= p50:
            return 50 + (value - p50) / (p75 - p50) * 25
        elif value >= p25:
            return 25 + (value - p25) / (p50 - p25) * 25
        else:
            return max(0, 25 * value / p25)  # Extrapolate below p25
    
    def _assess_overall_performance(self, comparisons: Dict) -> str:
        """Assess overall performance across all metrics"""
        if not comparisons:
            return 'Insufficient data'
        
        percentiles = [comp['percentile'] for comp in comparisons.values()]
        avg_percentile = statistics.mean(percentiles)
        
        if avg_percentile >= 75:
            return 'Exceptional'
        elif avg_percentile >= 60:
            return 'Above Average'
        elif avg_percentile >= 40:
            return 'Average'
        elif avg_percentile >= 25:
            return 'Below Average'
        else:
            return 'Poor'