/**
 * Specialized Analysis Agents - Founder, Market, Business, and Risk Analysis
 */

// Base Analysis Agent
class BaseAnalysisAgent {
  constructor(type) {
    this.type = type;
  }

  async process(data) {
    throw new Error('Process method must be implemented by subclass');
  }

  calculateScore(metrics, weights) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      if (metrics[key] !== undefined) {
        totalScore += metrics[key] * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
}

// Founder Analysis Agent
class FounderAnalysisAgent extends BaseAnalysisAgent {
  constructor() {
    super('founder');
    this.weights = {
      experience: 0.3,
      education: 0.2,
      trackRecord: 0.25,
      teamComplementarity: 0.15,
      commitment: 0.1
    };
  }

  async process(founderData) {
    const metrics = this.analyzeFounders(founderData);
    const score = this.calculateScore(metrics, this.weights);
    
    return {
      total: Math.round(score),
      breakdown: metrics,
      insights: this.generateInsights(metrics),
      redFlags: this.identifyRedFlags(metrics)
    };
  }

  analyzeFounders(data) {
    return {
      experience: this.scoreExperience(data.experience || []),
      education: this.scoreEducation(data.education || []),
      trackRecord: this.scoreTrackRecord(data.previousStartups || 0),
      teamComplementarity: this.scoreTeamComplementarity(data),
      commitment: this.scoreCommitment(data)
    };
  }

  scoreExperience(experience) {
    const totalYears = experience.reduce((sum, exp) => {
      const years = parseInt(exp.match(/\d+/)?.[0] || 0);
      return sum + years;
    }, 0);
    
    return Math.min(100, (totalYears / 15) * 100);
  }

  scoreEducation(education) {
    const topSchools = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'CMU'];
    const hasTopEducation = education.some(school => 
      topSchools.some(top => school.includes(top))
    );
    
    return hasTopEducation ? 90 : 70;
  }

  scoreTrackRecord(previousStartups) {
    if (previousStartups >= 2) return 95;
    if (previousStartups === 1) return 80;
    return 60;
  }

  scoreTeamComplementarity(data) {
    const skills = ['tech', 'business', 'finance', 'marketing'];
    const teamSkills = (data.experience || []).join(' ').toLowerCase();
    const coveredSkills = skills.filter(skill => teamSkills.includes(skill));
    
    return (coveredSkills.length / skills.length) * 100;
  }

  scoreCommitment(data) {
    // Simulate commitment analysis based on various factors
    return 75 + Math.random() * 25;
  }

  generateInsights(metrics) {
    const insights = [];
    
    if (metrics.experience > 80) {
      insights.push('Strong industry experience');
    }
    if (metrics.trackRecord > 85) {
      insights.push('Proven entrepreneurial track record');
    }
    if (metrics.teamComplementarity > 75) {
      insights.push('Well-balanced team composition');
    }
    
    return insights;
  }

  identifyRedFlags(metrics) {
    const redFlags = [];
    
    if (metrics.experience < 50) {
      redFlags.push('Limited relevant experience');
    }
    if (metrics.teamComplementarity < 60) {
      redFlags.push('Gaps in team skill set');
    }
    if (metrics.commitment < 70) {
      redFlags.push('Potential commitment concerns');
    }
    
    return redFlags;
  }
}

// Market Analysis Agent
class MarketAnalysisAgent extends BaseAnalysisAgent {
  constructor() {
    super('market');
    this.weights = {
      size: 0.25,
      growth: 0.3,
      competition: 0.2,
      timing: 0.15,
      accessibility: 0.1
    };
  }

  async process(marketData) {
    const metrics = this.analyzeMarket(marketData);
    const score = this.calculateScore(metrics, this.weights);
    
    return {
      total: Math.round(score),
      breakdown: metrics,
      trends: this.identifyTrends(marketData),
      opportunities: this.identifyOpportunities(metrics)
    };
  }

  analyzeMarket(data) {
    return {
      size: this.scoreMarketSize(data.tam || 0),
      growth: this.scoreGrowthRate(data.growth || 0),
      competition: this.scoreCompetition(data.competitors || []),
      timing: this.scoreTiming(data.trends || []),
      accessibility: this.scoreAccessibility(data)
    };
  }

  scoreMarketSize(tam) {
    if (tam > 10000000000) return 95; // >$10B
    if (tam > 1000000000) return 85;  // >$1B
    if (tam > 100000000) return 70;   // >$100M
    return 50;
  }

  scoreGrowthRate(growth) {
    if (growth > 0.2) return 95;  // >20%
    if (growth > 0.15) return 85; // >15%
    if (growth > 0.1) return 75;  // >10%
    if (growth > 0.05) return 60; // >5%
    return 40;
  }

  scoreCompetition(competitors) {
    const competitorCount = competitors.length;
    if (competitorCount === 0) return 95;
    if (competitorCount <= 2) return 80;
    if (competitorCount <= 5) return 65;
    return 45;
  }

  scoreTiming(trends) {
    const positiveTrends = ['AI adoption', 'Digital transformation', 'Remote work'];
    const matchingTrends = trends.filter(trend => 
      positiveTrends.some(positive => trend.includes(positive))
    );
    
    return Math.min(95, 60 + (matchingTrends.length * 15));
  }

  scoreAccessibility(data) {
    // Simulate market accessibility analysis
    return 70 + Math.random() * 25;
  }

  identifyTrends(data) {
    return data.trends || ['Market consolidation', 'Technology adoption', 'Regulatory changes'];
  }

  identifyOpportunities(metrics) {
    const opportunities = [];
    
    if (metrics.size > 80 && metrics.growth > 75) {
      opportunities.push('Large, fast-growing market');
    }
    if (metrics.competition < 60) {
      opportunities.push('Limited competition advantage');
    }
    if (metrics.timing > 80) {
      opportunities.push('Favorable market timing');
    }
    
    return opportunities;
  }
}

// Business Analysis Agent
class BusinessAnalysisAgent extends BaseAnalysisAgent {
  constructor() {
    super('business');
    this.weights = {
      revenue: 0.25,
      growth: 0.3,
      margins: 0.2,
      scalability: 0.15,
      sustainability: 0.1
    };
  }

  async process(businessData) {
    const metrics = this.analyzeBusiness(businessData);
    const score = this.calculateScore(metrics, this.weights);
    
    return {
      total: Math.round(score),
      breakdown: metrics,
      projections: this.generateProjections(businessData),
      recommendations: this.generateRecommendations(metrics)
    };
  }

  analyzeBusiness(data) {
    return {
      revenue: this.scoreRevenue(data.revenue || 0),
      growth: this.scoreGrowth(data.growth || 0),
      margins: this.scoreMargins(data),
      scalability: this.scoreScalability(data.scalability || 'medium'),
      sustainability: this.scoreSustainability(data)
    };
  }

  scoreRevenue(revenue) {
    if (revenue > 10000000) return 95; // >$10M
    if (revenue > 1000000) return 85;  // >$1M
    if (revenue > 100000) return 70;   // >$100K
    if (revenue > 10000) return 55;    // >$10K
    return 30;
  }

  scoreGrowth(growth) {
    if (growth > 1.0) return 95;   // >100%
    if (growth > 0.5) return 85;   // >50%
    if (growth > 0.3) return 75;   // >30%
    if (growth > 0.15) return 65;  // >15%
    return 45;
  }

  scoreMargins(data) {
    const revenue = data.revenue || 0;
    const costs = data.costs || revenue * 0.7;
    const margin = revenue > 0 ? (revenue - costs) / revenue : 0;
    
    if (margin > 0.8) return 95;
    if (margin > 0.6) return 85;
    if (margin > 0.4) return 75;
    if (margin > 0.2) return 60;
    return 40;
  }

  scoreScalability(scalability) {
    const scores = { high: 90, medium: 70, low: 40 };
    return scores[scalability] || 60;
  }

  scoreSustainability(data) {
    // Analyze business model sustainability
    const factors = [
      data.recurring ? 20 : 0,
      data.networkEffects ? 15 : 0,
      data.switchingCosts ? 15 : 0,
      data.brandStrength ? 10 : 0
    ];
    
    return 40 + factors.reduce((sum, factor) => sum + factor, 0);
  }

  generateProjections(data) {
    const currentRevenue = data.revenue || 0;
    const growthRate = data.growth || 0.3;
    
    return {
      year1: Math.round(currentRevenue * (1 + growthRate)),
      year2: Math.round(currentRevenue * Math.pow(1 + growthRate, 2)),
      year3: Math.round(currentRevenue * Math.pow(1 + growthRate, 3))
    };
  }

  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.revenue < 60) {
      recommendations.push('Focus on revenue generation');
    }
    if (metrics.margins < 70) {
      recommendations.push('Improve unit economics');
    }
    if (metrics.scalability < 75) {
      recommendations.push('Enhance scalability mechanisms');
    }
    
    return recommendations;
  }
}

// Risk Analysis Agent
class RiskAnalysisAgent extends BaseAnalysisAgent {
  constructor() {
    super('risk');
    this.riskFactors = {
      market: 0.3,
      team: 0.25,
      financial: 0.25,
      technology: 0.2
    };
  }

  async process(data) {
    const risks = this.analyzeRisks(data);
    const totalRisk = this.calculateTotalRisk(risks);
    
    return {
      totalRisk: Math.round(totalRisk),
      breakdown: risks,
      factors: this.identifyRiskFactors(risks),
      mitigation: this.suggestMitigation(risks)
    };
  }

  analyzeRisks(data) {
    return {
      marketRisk: this.assessMarketRisk(data.marketData || {}),
      teamRisk: this.assessTeamRisk(data.founderData || {}),
      financialRisk: this.assessFinancialRisk(data.businessData || {}),
      technologyRisk: this.assessTechnologyRisk(data.product || {})
    };
  }

  assessMarketRisk(marketData) {
    let risk = 0.3; // Base risk
    
    if (marketData.competitors?.length > 5) risk += 0.2;
    if (marketData.growth < 0.1) risk += 0.15;
    if (marketData.tam < 1000000000) risk += 0.1;
    
    return Math.min(1, risk);
  }

  assessTeamRisk(founderData) {
    let risk = 0.2; // Base risk
    
    const totalExperience = (founderData.experience || []).length;
    if (totalExperience < 2) risk += 0.3;
    if (!founderData.previousStartups) risk += 0.2;
    
    return Math.min(1, risk);
  }

  assessFinancialRisk(businessData) {
    let risk = 0.25; // Base risk
    
    if (businessData.burn > businessData.revenue) risk += 0.3;
    if (businessData.runway < 12) risk += 0.25;
    if (!businessData.revenue) risk += 0.2;
    
    return Math.min(1, risk);
  }

  assessTechnologyRisk(productData) {
    let risk = 0.2; // Base risk
    
    if (productData.stage === 'idea') risk += 0.4;
    if (productData.stage === 'prototype') risk += 0.2;
    if (!productData.ip) risk += 0.15;
    
    return Math.min(1, risk);
  }

  calculateTotalRisk(risks) {
    return (
      risks.marketRisk * this.riskFactors.market +
      risks.teamRisk * this.riskFactors.team +
      risks.financialRisk * this.riskFactors.financial +
      risks.technologyRisk * this.riskFactors.technology
    ) * 100;
  }

  identifyRiskFactors(risks) {
    const factors = [];
    
    if (risks.marketRisk > 0.7) factors.push('High market competition');
    if (risks.teamRisk > 0.6) factors.push('Team experience gaps');
    if (risks.financialRisk > 0.8) factors.push('Financial sustainability concerns');
    if (risks.technologyRisk > 0.5) factors.push('Technology execution risk');
    
    return factors;
  }

  suggestMitigation(risks) {
    const strategies = [];
    
    if (risks.marketRisk > 0.6) {
      strategies.push('Develop strong differentiation strategy');
    }
    if (risks.teamRisk > 0.5) {
      strategies.push('Consider adding experienced advisors');
    }
    if (risks.financialRisk > 0.7) {
      strategies.push('Implement milestone-based funding');
    }
    if (risks.technologyRisk > 0.4) {
      strategies.push('Conduct technical due diligence');
    }
    
    return strategies;
  }
}

export {
  FounderAnalysisAgent,
  MarketAnalysisAgent,
  BusinessAnalysisAgent,
  RiskAnalysisAgent
};