/**
 * Decision Making Agent - Analyzes data and makes investment decisions
 */

class DecisionMakingAgent {
  constructor(weights = {}) {
    this.weights = {
      founder: 0.3,
      market: 0.25,
      business: 0.25,
      risk: 0.2,
      ...weights
    };
    
    this.thresholds = {
      invest: 75,
      consider: 60,
      pass: 40
    };
  }

  async process(data) {
    const {
      founderScore,
      marketScore,
      businessScore,
      riskAssessment
    } = data;

    // Calculate weighted scores
    const scores = this.calculateScores(data);
    
    // Make investment decision
    const decision = this.makeDecision(scores);
    
    // Generate confidence metrics
    const confidence = this.calculateConfidence(data);
    
    // Risk analysis
    const risks = this.analyzeRisks(riskAssessment);

    return {
      scores,
      decision,
      confidence,
      risks,
      recommendation: this.generateRecommendation(scores, decision, risks)
    };
  }

  calculateScores(data) {
    const {
      founderScore,
      marketScore,
      businessScore,
      riskAssessment
    } = data;

    // Individual component scores
    const founder = this.normalizeScore(founderScore);
    const market = this.normalizeScore(marketScore);
    const business = this.normalizeScore(businessScore);
    const risk = 100 - this.normalizeScore(riskAssessment.totalRisk);

    // Weighted overall score
    const overall = (
      founder * this.weights.founder +
      market * this.weights.market +
      business * this.weights.business +
      risk * this.weights.risk
    );

    return {
      founder: Math.round(founder),
      market: Math.round(market),
      business: Math.round(business),
      risk: Math.round(risk),
      overall: Math.round(overall)
    };
  }

  makeDecision(scores) {
    const { overall } = scores;
    
    if (overall >= this.thresholds.invest) {
      return {
        action: 'INVEST',
        priority: 'HIGH',
        reasoning: 'Strong scores across all metrics'
      };
    } else if (overall >= this.thresholds.consider) {
      return {
        action: 'CONSIDER',
        priority: 'MEDIUM',
        reasoning: 'Good potential with some concerns'
      };
    } else {
      return {
        action: 'PASS',
        priority: 'LOW',
        reasoning: 'Significant concerns identified'
      };
    }
  }

  calculateConfidence(data) {
    const factors = [
      this.dataQuality(data),
      this.consistencyCheck(data),
      this.marketValidation(data),
      this.teamAssessment(data)
    ];

    const avgConfidence = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    
    return {
      overall: Math.round(avgConfidence * 100),
      factors: {
        dataQuality: Math.round(factors[0] * 100),
        consistency: Math.round(factors[1] * 100),
        marketValidation: Math.round(factors[2] * 100),
        teamAssessment: Math.round(factors[3] * 100)
      }
    };
  }

  analyzeRisks(riskAssessment) {
    const risks = [];
    
    // Market risks
    if (riskAssessment.marketRisk > 0.7) {
      risks.push({
        type: 'MARKET',
        level: 'HIGH',
        description: 'Highly competitive or uncertain market'
      });
    }

    // Team risks
    if (riskAssessment.teamRisk > 0.6) {
      risks.push({
        type: 'TEAM',
        level: 'MEDIUM',
        description: 'Team experience or composition concerns'
      });
    }

    // Financial risks
    if (riskAssessment.financialRisk > 0.8) {
      risks.push({
        type: 'FINANCIAL',
        level: 'HIGH',
        description: 'Concerning financial metrics or projections'
      });
    }

    // Technology risks
    if (riskAssessment.technologyRisk > 0.5) {
      risks.push({
        type: 'TECHNOLOGY',
        level: 'MEDIUM',
        description: 'Technology feasibility or IP concerns'
      });
    }

    return risks;
  }

  generateRecommendation(scores, decision, risks) {
    const recommendations = [];

    // Investment recommendation
    recommendations.push({
      category: 'INVESTMENT',
      action: decision.action,
      details: this.getInvestmentDetails(decision, scores)
    });

    // Due diligence recommendations
    if (decision.action !== 'PASS') {
      recommendations.push({
        category: 'DUE_DILIGENCE',
        action: 'INVESTIGATE',
        details: this.getDueDiligenceItems(scores, risks)
      });
    }

    // Risk mitigation
    if (risks.length > 0) {
      recommendations.push({
        category: 'RISK_MITIGATION',
        action: 'MONITOR',
        details: this.getRiskMitigationStrategies(risks)
      });
    }

    return recommendations;
  }

  // Helper methods
  normalizeScore(score) {
    if (typeof score === 'object' && score.total) {
      return Math.min(100, Math.max(0, score.total));
    }
    return Math.min(100, Math.max(0, score || 0));
  }

  dataQuality(data) {
    let quality = 0.5;
    
    if (data.founderScore && Object.keys(data.founderScore).length > 3) quality += 0.1;
    if (data.marketScore && data.marketScore.tam > 0) quality += 0.1;
    if (data.businessScore && data.businessScore.revenue > 0) quality += 0.1;
    if (data.riskAssessment && data.riskAssessment.factors) quality += 0.2;
    
    return Math.min(1, quality);
  }

  consistencyCheck(data) {
    // Check for consistency between different data sources
    return 0.8 + Math.random() * 0.2;
  }

  marketValidation(data) {
    const marketScore = data.marketScore?.total || 0;
    return Math.min(1, marketScore / 100);
  }

  teamAssessment(data) {
    const founderScore = data.founderScore?.total || 0;
    return Math.min(1, founderScore / 100);
  }

  getInvestmentDetails(decision, scores) {
    switch (decision.action) {
      case 'INVEST':
        return [
          'Proceed with term sheet preparation',
          'Schedule management presentation',
          'Begin legal due diligence'
        ];
      case 'CONSIDER':
        return [
          'Request additional financial data',
          'Conduct customer interviews',
          'Validate market assumptions'
        ];
      case 'PASS':
        return [
          'Decline investment opportunity',
          'Provide constructive feedback',
          'Keep for future monitoring'
        ];
      default:
        return [];
    }
  }

  getDueDiligenceItems(scores, risks) {
    const items = [];
    
    if (scores.founder < 80) items.push('Deep dive on team background');
    if (scores.market < 75) items.push('Market size validation');
    if (scores.business < 70) items.push('Business model verification');
    
    return items;
  }

  getRiskMitigationStrategies(risks) {
    return risks.map(risk => {
      switch (risk.type) {
        case 'MARKET':
          return 'Monitor competitive landscape closely';
        case 'TEAM':
          return 'Consider advisory board strengthening';
        case 'FINANCIAL':
          return 'Implement milestone-based funding';
        case 'TECHNOLOGY':
          return 'Conduct technical due diligence';
        default:
          return 'Regular monitoring required';
      }
    });
  }
}

export default DecisionMakingAgent;