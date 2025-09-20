/**
 * Complete Multi-Agent System Integration
 * Combines all agents for comprehensive startup analysis
 */

import AgentOrchestrator from './AgentOrchestrator.js';
import DataExtractionAgent from './DataExtractionAgent.js';
import DecisionMakingAgent from './DecisionMakingAgent.js';
import {
  FounderAnalysisAgent,
  MarketAnalysisAgent,
  BusinessAnalysisAgent,
  RiskAnalysisAgent
} from './AnalysisAgents.js';

class MultiAgentSystem {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.setupAgents();
    this.isInitialized = false;
  }

  setupAgents() {
    // Data Extraction Agents
    this.orchestrator.registerAgent('documentExtractor', new DataExtractionAgent('document'));
    this.orchestrator.registerAgent('voiceExtractor', new DataExtractionAgent('voice'));
    this.orchestrator.registerAgent('publicDataExtractor', new DataExtractionAgent('publicData'));
    
    // Data Processing Agent
    this.orchestrator.registerAgent('dataProcessor', new DataProcessingAgent());
    
    // Analysis Agents
    this.orchestrator.registerAgent('founderAnalyst', new FounderAnalysisAgent());
    this.orchestrator.registerAgent('marketAnalyst', new MarketAnalysisAgent());
    this.orchestrator.registerAgent('businessAnalyst', new BusinessAnalysisAgent());
    this.orchestrator.registerAgent('riskAnalyst', new RiskAnalysisAgent());
    
    // Decision Making Agent
    this.orchestrator.registerAgent('decisionMaker', new DecisionMakingAgent());
    
    // Memo Generation Agent
    this.orchestrator.registerAgent('memoGenerator', new MemoGenerationAgent());
    
    this.isInitialized = true;
  }

  async analyzeStartup(inputData, progressCallback) {
    if (!this.isInitialized) {
      throw new Error('Multi-agent system not initialized');
    }

    try {
      // Update progress
      if (progressCallback) progressCallback('Initializing analysis...', 0);

      // Run the complete analysis pipeline
      const result = await this.orchestrator.analyzeStartup(inputData);
      
      if (progressCallback) progressCallback('Analysis complete!', 100);
      
      return {
        success: true,
        data: result,
        timestamp: new Date(),
        analysisId: `analysis_${Date.now()}`
      };

    } catch (error) {
      console.error('Multi-agent analysis failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      orchestrator: this.orchestrator.getStatus(),
      agents: {
        extraction: ['documentExtractor', 'voiceExtractor', 'publicDataExtractor'],
        analysis: ['founderAnalyst', 'marketAnalyst', 'businessAnalyst', 'riskAnalyst'],
        decision: ['decisionMaker'],
        output: ['memoGenerator']
      }
    };
  }

  // Method to update agent weights/preferences
  updateAnalysisWeights(weights) {
    const decisionAgent = this.orchestrator.agents.get('decisionMaker');
    if (decisionAgent) {
      decisionAgent.weights = { ...decisionAgent.weights, ...weights };
    }
  }
}

// Data Processing Agent - Consolidates extracted data
class DataProcessingAgent {
  async process(data) {
    const { documents, voice, publicData } = data;
    
    // Consolidate and structure data for analysis
    return {
      founderData: this.consolidateFounderData(documents, voice),
      marketData: this.consolidateMarketData(documents, publicData),
      businessData: this.consolidateBusinessData(documents, voice),
      productData: this.consolidateProductData(documents)
    };
  }

  consolidateFounderData(documents, voice) {
    return {
      ...documents.founderInfo,
      sentiment: voice.sentiment,
      confidence: voice.confidence,
      keyPoints: voice.keyPoints
    };
  }

  consolidateMarketData(documents, publicData) {
    return {
      ...documents.market,
      ...publicData.marketData,
      competitors: publicData.competitors,
      news: publicData.news
    };
  }

  consolidateBusinessData(documents, voice) {
    return {
      ...documents.businessModel,
      ...documents.financials,
      voiceInsights: voice.keyPoints
    };
  }

  consolidateProductData(documents) {
    return documents.product || {};
  }
}

// Memo Generation Agent
class MemoGenerationAgent {
  async process(data) {
    const { analysisResults, decision, inputData } = data;
    
    return {
      executive_summary: this.generateExecutiveSummary(decision),
      investment_thesis: this.generateInvestmentThesis(analysisResults),
      detailed_analysis: this.generateDetailedAnalysis(analysisResults),
      risk_assessment: this.generateRiskAssessment(analysisResults[3]),
      recommendation: this.generateRecommendation(decision),
      next_steps: this.generateNextSteps(decision),
      appendices: this.generateAppendices(inputData)
    };
  }

  generateExecutiveSummary(decision) {
    return {
      recommendation: decision.decision.action,
      overall_score: decision.scores.overall,
      key_strengths: this.identifyKeyStrengths(decision.scores),
      main_concerns: decision.risks.map(r => r.description),
      investment_size: this.suggestInvestmentSize(decision)
    };
  }

  generateInvestmentThesis(results) {
    return {
      market_opportunity: results[1].opportunities,
      competitive_advantage: this.identifyCompetitiveAdvantage(results),
      team_strength: results[0].insights,
      business_model: results[2].recommendations,
      growth_potential: results[2].projections
    };
  }

  generateDetailedAnalysis(results) {
    return {
      founder_analysis: {
        score: results[0].total,
        breakdown: results[0].breakdown,
        insights: results[0].insights,
        red_flags: results[0].redFlags
      },
      market_analysis: {
        score: results[1].total,
        breakdown: results[1].breakdown,
        trends: results[1].trends,
        opportunities: results[1].opportunities
      },
      business_analysis: {
        score: results[2].total,
        breakdown: results[2].breakdown,
        projections: results[2].projections,
        recommendations: results[2].recommendations
      }
    };
  }

  generateRiskAssessment(riskAnalysis) {
    return {
      overall_risk: riskAnalysis.totalRisk,
      risk_breakdown: riskAnalysis.breakdown,
      key_factors: riskAnalysis.factors,
      mitigation_strategies: riskAnalysis.mitigation
    };
  }

  generateRecommendation(decision) {
    return {
      action: decision.decision.action,
      priority: decision.decision.priority,
      reasoning: decision.decision.reasoning,
      confidence: decision.confidence.overall,
      conditions: this.generateConditions(decision)
    };
  }

  generateNextSteps(decision) {
    return decision.recommendation.map(rec => ({
      category: rec.category,
      action: rec.action,
      timeline: this.suggestTimeline(rec.category),
      owner: this.suggestOwner(rec.category),
      details: rec.details
    }));
  }

  generateAppendices(inputData) {
    return {
      data_sources: this.listDataSources(inputData),
      methodology: this.describeMethodology(),
      assumptions: this.listAssumptions(),
      disclaimers: this.generateDisclaimers()
    };
  }

  // Helper methods
  identifyKeyStrengths(scores) {
    const strengths = [];
    if (scores.founder > 80) strengths.push('Strong founding team');
    if (scores.market > 80) strengths.push('Large market opportunity');
    if (scores.business > 80) strengths.push('Solid business model');
    if (scores.risk < 30) strengths.push('Low risk profile');
    return strengths;
  }

  identifyCompetitiveAdvantage(results) {
    // Analyze competitive advantages from market and business analysis
    return [
      'Technology differentiation',
      'First-mover advantage',
      'Strong team expertise'
    ];
  }

  suggestInvestmentSize(decision) {
    const scoreRanges = {
      'INVEST': '$2M - $5M',
      'CONSIDER': '$500K - $2M',
      'PASS': 'Not recommended'
    };
    return scoreRanges[decision.decision.action] || 'TBD';
  }

  generateConditions(decision) {
    if (decision.decision.action === 'INVEST') {
      return ['Successful due diligence', 'Acceptable terms'];
    } else if (decision.decision.action === 'CONSIDER') {
      return ['Address identified concerns', 'Provide additional data'];
    }
    return [];
  }

  suggestTimeline(category) {
    const timelines = {
      'INVESTMENT': '2-4 weeks',
      'DUE_DILIGENCE': '4-6 weeks',
      'RISK_MITIGATION': 'Ongoing'
    };
    return timelines[category] || '2-3 weeks';
  }

  suggestOwner(category) {
    const owners = {
      'INVESTMENT': 'Investment Committee',
      'DUE_DILIGENCE': 'Due Diligence Team',
      'RISK_MITIGATION': 'Portfolio Management'
    };
    return owners[category] || 'Investment Team';
  }

  listDataSources(inputData) {
    const sources = [];
    if (inputData.documents) sources.push('Pitch deck and documents');
    if (inputData.voiceData) sources.push('Founder interview');
    sources.push('Public market data', 'Competitive intelligence');
    return sources;
  }

  describeMethodology() {
    return 'Multi-agent AI analysis using specialized algorithms for founder, market, business, and risk assessment';
  }

  listAssumptions() {
    return [
      'Market data accuracy',
      'Financial projections reliability',
      'Team commitment levels',
      'Competitive landscape stability'
    ];
  }

  generateDisclaimers() {
    return [
      'Analysis based on available information at time of review',
      'Market conditions subject to change',
      'Investment decisions should consider additional factors',
      'Past performance does not guarantee future results'
    ];
  }
}

export default MultiAgentSystem;