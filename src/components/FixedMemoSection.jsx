import React from 'react';
import { FileText, Download, Users, TrendingUp, Lightbulb, BarChart3, AlertTriangle } from 'lucide-react';

const FixedMemoSection = ({ analysisResults }) => {
  if (!analysisResults) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
        <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Investment Memo Available</h3>
        <p className="text-purple-200 mb-6">Run a comprehensive analysis to generate a detailed investment memo.</p>
      </div>
    );
  }

  const agentTitles = {
    founder: 'Founder & Team Analysis',
    market: 'Market Opportunity Assessment', 
    product: 'Product & Differentiation Analysis',
    traction: 'Business Traction & Metrics',
    risk: 'Risk Assessment & Mitigation'
  };
  
  const agentIcons = {
    founder: Users,
    market: TrendingUp,
    product: Lightbulb,
    traction: BarChart3,
    risk: AlertTriangle
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Investment Memo</h2>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-purple-200">
              <FileText className="w-4 h-4" />
              <span>AI-Generated Professional Memo</span>
            </div>
            <button 
              onClick={() => alert('PDF export feature coming soon!')}
              className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {analysisResults.agent_results && Object.entries(analysisResults.agent_results).map(([agent, data], index) => {
            const Icon = agentIcons[agent] || FileText;
            
            return (
              <div key={agent} className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {agentTitles[agent] || agent.charAt(0).toUpperCase() + agent.slice(1)}
                      </h3>
                      <p className="text-purple-200 text-sm">AI Agent Analysis • {data.model_used || 'GROQ LLM'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold">
                      {data.score}/100
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    AI Analysis Summary
                  </h4>
                  <p className="text-purple-100 leading-relaxed text-base">
                    {data.summary || `Comprehensive ${agent} analysis completed using advanced AI models.`}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-200">Confidence Level</span>
                      <span className="text-white font-semibold">{((data.confidence || 0.8) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.confidence || 0.8) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-200">Processing Time</span>
                      <span className="text-white font-semibold">{(data.processing_time || 2.5).toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">AI Model</span>
                      <span className="text-white font-semibold text-xs">{data.model_used || 'GROQ LLM'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Investment Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Investment Recommendation Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">
                {analysisResults.investment_recommendation?.recommendation || 'Consider'}
              </div>
              <p className="text-purple-100 leading-relaxed">
                {analysisResults.investment_recommendation?.rationale || 'Based on comprehensive AI analysis across multiple dimensions.'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-lg font-semibold mb-1">Overall Score</div>
                <div className="text-2xl font-bold">{analysisResults.overall_score}/100</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-lg font-semibold mb-1">Success Probability</div>
                <div className="text-2xl font-bold">{analysisResults.success_prediction?.success_percentage || '75%'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedMemoSection;