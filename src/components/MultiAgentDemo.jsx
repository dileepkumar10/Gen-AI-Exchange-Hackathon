import React, { useState, useEffect } from 'react';
import { Play, Users, Brain, TrendingUp, AlertTriangle, FileText, Mic } from 'lucide-react';

const MultiAgentDemo = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [agentStatus, setAgentStatus] = useState({});

  const agents = [
    { id: 'documentExtractor', name: 'Document Extractor', icon: FileText, color: 'blue' },
    { id: 'voiceExtractor', name: 'Voice Analyzer', icon: Mic, color: 'green' },
    { id: 'publicDataExtractor', name: 'Market Intelligence', icon: TrendingUp, color: 'purple' },
    { id: 'founderAnalyst', name: 'Founder Analyst', icon: Users, color: 'orange' },
    { id: 'marketAnalyst', name: 'Market Analyst', icon: TrendingUp, color: 'blue' },
    { id: 'businessAnalyst', name: 'Business Analyst', icon: Brain, color: 'green' },
    { id: 'riskAnalyst', name: 'Risk Analyst', icon: AlertTriangle, color: 'red' },
    { id: 'decisionMaker', name: 'Decision Engine', icon: Brain, color: 'purple' }
  ];

  const simulateMultiAgentAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);
    setAgentStatus({});

    // Phase 1: Data Extraction (Parallel)
    const extractionAgents = ['documentExtractor', 'voiceExtractor', 'publicDataExtractor'];
    
    for (let i = 0; i < extractionAgents.length; i++) {
      const agentId = extractionAgents[i];
      setCurrentAgent(agentId);
      setAgentStatus(prev => ({ ...prev, [agentId]: 'processing' }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAgentStatus(prev => ({ ...prev, [agentId]: 'completed' }));
      setProgress(15 + (i * 10));
    }

    // Phase 2: Analysis (Parallel)
    const analysisAgents = ['founderAnalyst', 'marketAnalyst', 'businessAnalyst', 'riskAnalyst'];
    
    for (let i = 0; i < analysisAgents.length; i++) {
      const agentId = analysisAgents[i];
      setCurrentAgent(agentId);
      setAgentStatus(prev => ({ ...prev, [agentId]: 'processing' }));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAgentStatus(prev => ({ ...prev, [agentId]: 'completed' }));
      setProgress(45 + (i * 10));
    }

    // Phase 3: Decision Making
    setCurrentAgent('decisionMaker');
    setAgentStatus(prev => ({ ...prev, decisionMaker: 'processing' }));
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAgentStatus(prev => ({ ...prev, decisionMaker: 'completed' }));
    setProgress(90);

    // Generate results
    const mockResults = {
      scores: {
        founder: 85,
        market: 78,
        business: 82,
        risk: 25,
        overall: 81
      },
      decision: {
        action: 'INVEST',
        priority: 'HIGH',
        reasoning: 'Strong team with solid market opportunity'
      },
      confidence: 87,
      processingTime: '2.3 minutes',
      agentsUsed: 8
    };

    setResults(mockResults);
    setProgress(100);
    setCurrentAgent('');
    setIsAnalyzing(false);
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getAgentStatusIcon = (status) => {
    switch (status) {
      case 'processing': return '⚡';
      case 'completed': return '✅';
      default: return '⏳';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Multi-Agent AI Analysis System
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Watch 8 specialized AI agents work together to analyze startup investments
        </p>
        
        <button
          onClick={simulateMultiAgentAnalysis}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
        >
          <Play className="w-5 h-5" />
          {isAnalyzing ? 'Analyzing...' : 'Start Multi-Agent Analysis'}
        </button>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {currentAgent && (
            <p className="text-sm text-gray-600 mt-2">
              Currently running: <span className="font-semibold">{agents.find(a => a.id === currentAgent)?.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Agent Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const status = agentStatus[agent.id];
          
          return (
            <div
              key={agent.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${getAgentStatusColor(status)}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{agent.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs">{getAgentStatusIcon(status)}</span>
                    <span className="text-xs capitalize">{status || 'waiting'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Multi-Agent Analysis Complete! 🎉
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{results.scores.founder}</div>
              <div className="text-sm text-gray-600">Founder Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{results.scores.market}</div>
              <div className="text-sm text-gray-600">Market Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{results.scores.business}</div>
              <div className="text-sm text-gray-600">Business Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{100 - results.scores.risk}</div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {results.scores.overall}/100
            </div>
            <div className="text-lg text-gray-600 mb-4">Overall Investment Score</div>
            
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              results.decision.action === 'INVEST' 
                ? 'bg-green-100 text-green-800' 
                : results.decision.action === 'CONSIDER'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              Recommendation: {results.decision.action}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{results.confidence}%</div>
              <div className="text-sm text-gray-600">AI Confidence</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{results.processingTime}</div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{results.agentsUsed}</div>
              <div className="text-sm text-gray-600">Agents Used</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-700 font-medium">{results.decision.reasoning}</p>
          </div>
        </div>
      )}

      {/* Architecture Explanation */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Agent Architecture</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Phase 1: Data Extraction</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Document parsing and analysis</li>
              <li>• Voice pattern recognition</li>
              <li>• Public market intelligence</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Phase 2: Specialized Analysis</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Founder background evaluation</li>
              <li>• Market opportunity assessment</li>
              <li>• Business model analysis</li>
              <li>• Risk factor identification</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Phase 3: Decision Making</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Weighted score calculation</li>
              <li>• Investment recommendation</li>
              <li>• Confidence assessment</li>
              <li>• Professional memo generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentDemo;