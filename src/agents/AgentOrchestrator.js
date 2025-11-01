/**
 * Multi-Agent Orchestrator for AI Startup Analyst
 * Coordinates multiple specialized agents for data extraction and decision making
 */

class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.taskQueue = [];
    this.results = new Map();
    this.isProcessing = false;
  }

  // Register specialized agents
  registerAgent(name, agent) {
    this.agents.set(name, agent);
    console.log(`Agent ${name} registered`);
  }

  // Main orchestration method
  async analyzeStartup(inputData) {
    this.isProcessing = true;
    const analysisId = `analysis_${Date.now()}`;
    
    try {
      // Phase 1: Data Extraction (Parallel)
      const extractionTasks = [
        this.runAgent('documentExtractor', inputData.documents),
        this.runAgent('voiceExtractor', inputData.voiceData),
        this.runAgent('publicDataExtractor', inputData.companyName)
      ];

      const extractedData = await Promise.all(extractionTasks);
      
      // Phase 2: Data Processing (Sequential)
      const processedData = await this.runAgent('dataProcessor', {
        documents: extractedData[0],
        voice: extractedData[1],
        publicData: extractedData[2]
      });

      // Phase 3: Analysis (Parallel)
      const analysisTasks = [
        this.runAgent('founderAnalyst', processedData.founderData),
        this.runAgent('marketAnalyst', processedData.marketData),
        this.runAgent('businessAnalyst', processedData.businessData),
        this.runAgent('riskAnalyst', processedData)
      ];

      const analysisResults = await Promise.all(analysisTasks);

      // Phase 4: Decision Making
      const decision = await this.runAgent('decisionMaker', {
        founderScore: analysisResults[0],
        marketScore: analysisResults[1],
        businessScore: analysisResults[2],
        riskAssessment: analysisResults[3]
      });

      // Phase 5: Memo Generation
      const memo = await this.runAgent('memoGenerator', {
        analysisResults,
        decision,
        inputData
      });

      this.results.set(analysisId, {
        scores: decision.scores,
        memo: memo,
        timestamp: new Date(),
        confidence: decision.confidence
      });

      return this.results.get(analysisId);

    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Execute individual agent
  async runAgent(agentName, data) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    console.log(`Running agent: ${agentName}`);
    return await agent.process(data);
  }

  // Get analysis status
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      registeredAgents: Array.from(this.agents.keys()),
      completedAnalyses: this.results.size
    };
  }
}

export default AgentOrchestrator;