import React, { useState, useEffect } from 'react';
import { Upload, FileText, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import apiService from '../services/api';

const ComprehensiveAnalysis = ({ uploadedFiles, analysisResults: parentAnalysisResults, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisResults, setAnalysisResults] = useState(parentAnalysisResults || null);
  const [investorPreferences, setInvestorPreferences] = useState({
    founder_weight: 25,
    market_weight: 25,
    product_weight: 20,
    traction_weight: 15,
    finance_weight: 10,
    risk_weight: 5,
    min_overall_score: 70,
    risk_tolerance: 'medium'
  });

  const analysisSteps = [
    { name: "Document Processing", description: "Extracting text from uploaded documents..." },
    { name: "Data Enrichment", description: "Gathering external market intelligence..." },
    { name: "AI Agent Analysis", description: "Running specialized analysis agents..." },
    { name: "Financial Analysis", description: "Calculating unit economics and metrics..." },
    { name: "Industry Benchmarking", description: "Comparing against industry benchmarks..." },
    { name: "Market Intelligence", description: "Analyzing market opportunity..." },
    { name: "Report Generation", description: "Generating comprehensive report..." }
  ];

  useEffect(() => {
    // Load investor preferences
    loadInvestorPreferences();
  }, []);
  
  // Only show results if they exist and no new files uploaded
  useEffect(() => {
    if (parentAnalysisResults && uploadedFiles.length === 0) {
      setAnalysisResults(parentAnalysisResults);
    }
  }, [parentAnalysisResults, uploadedFiles]);
  
  // Clear results when files change
  useEffect(() => {
    if (!isAnalyzing) {
      setAnalysisResults(null);
      if (onAnalysisComplete) {
        onAnalysisComplete(null);
      }
    }
  }, [uploadedFiles]);
  
  // Clear results when parent clears them
  useEffect(() => {
    if (parentAnalysisResults === null) {
      setAnalysisResults(null);
    }
  }, [parentAnalysisResults]);

  const loadInvestorPreferences = async () => {
    try {
      const preferences = await apiService.getInvestorPreferences();
      setInvestorPreferences(preferences);
    } catch (error) {
      console.log('Using default investor preferences');
    }
  };

  const saveInvestorPreferences = async () => {
    try {
      await apiService.saveInvestorPreferences(investorPreferences);
      alert('Investor preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences');
    }
  };

  const startComprehensiveAnalysis = async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      alert('Please upload files first');
      return;
    }

    // Smooth scroll to top of the page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep('Starting analysis...');

    try {
      // Simulate progress for better UX - more realistic timing
      let progressInterval;
      let progress = 0;
      
      const simulateProgress = () => {
        progressInterval = setInterval(() => {
          progress += Math.random() * 8 + 2; // Slower, more consistent progress
          if (progress < 85) { // Stop at 85% to wait for actual completion
            setAnalysisProgress(Math.min(progress, 85));
            const stepIndex = Math.floor((progress / 100) * analysisSteps.length);
            if (stepIndex < analysisSteps.length) {
              setCurrentStep(analysisSteps[stepIndex].description);
            }
          }
        }, 1500); // Slower updates
      };
      
      simulateProgress();

      // Convert uploaded files to File objects if needed
      const files = uploadedFiles.map(file => file.file || file);

      // Start comprehensive analysis using the correct endpoint
      console.log('Calling comprehensive analysis endpoint...');
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (investorPreferences) {
        formData.append('investor_preferences', JSON.stringify(investorPreferences));
      }
      
      const response = await apiService.request('/api/v2/comprehensive-analysis', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });

      console.log('Analysis completed:', response);
      
      // Progress will be cleared when response is handled
      
      // Handle direct response (not WebSocket)
      if (response) {
        // Handle comprehensive analysis response format
        const enhancedResponse = {
          ...response,
          companyInfo: {
            companyName: uploadedFiles.length > 0 ? 
              uploadedFiles[0].name.replace(/\.(pdf|pptx|docx|ppt|doc|txt)$/i, '').replace(/[-_]/g, ' ').trim() : 
              response.company_name || 'Sample Company',
            sector: response.sector || 'Technology',
            stage: response.stage || 'Early Stage',
            foundedYear: response.founded_year || new Date().getFullYear().toString(),
            location: response.location || 'Location not specified'
          },
          // Calculate overall score from agent results if not provided
          overall_score: response.overall_score || (() => {
            const agents = response.agent_results || {};
            const scores = Object.values(agents).map(agent => agent.score || 0);
            return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
          })(),
          overall_confidence: response.confidence || response.overall_confidence,
          investment_recommendation: response.investment_recommendation,
          agent_results: response.agent_results,
          category_scores: response.category_scores,
          success_prediction: response.success_prediction,
          key_insights: response.key_insights,
          next_steps: response.next_steps
        };
        
        console.log('Enhanced response with company info:', enhancedResponse);
        
        // Clear the progress interval first
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        // Complete the progress animation smoothly
        const completeProgress = setInterval(() => {
          progress += 5;
          setAnalysisProgress(Math.min(progress, 100));
          
          if (progress >= 100) {
            clearInterval(completeProgress);
            setCurrentStep('Analysis completed!');
            
            // Wait a moment before showing results
            setTimeout(() => {
              setAnalysisResults(enhancedResponse);
              setIsAnalyzing(false);
              
              if (onAnalysisComplete) {
                onAnalysisComplete(enhancedResponse);
              }
            }, 1500); // Wait 1.5 seconds after progress completes
          }
        }, 200); // Update every 200ms for smooth completion
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      if (typeof progressInterval !== 'undefined') {
        clearInterval(progressInterval);
      }
      setIsAnalyzing(false);
      setCurrentStep('Analysis failed');
      setAnalysisProgress(0);
      alert(`Analysis failed: ${error.message}`);
    }
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
        style={{ width: `${analysisProgress}%` }}
      />
    </div>
  );

  const renderAnalysisSteps = () => (
    <div className="space-y-3">
      {analysisSteps.map((step, index) => {
        const stepProgress = (analysisProgress / 100) * analysisSteps.length;
        const isCompleted = stepProgress > index + 1;
        const isCurrent = stepProgress > index && stepProgress <= index + 1;
        
        return (
          <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
            isCompleted ? 'bg-green-50 text-green-800' :
            isCurrent ? 'bg-blue-50 text-blue-800' :
            'bg-gray-50 text-gray-600'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isCurrent ? (
              <Clock className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
            <div>
              <div className="font-medium">{step.name}</div>
              <div className="text-sm opacity-75">{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderInvestorPreferences = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2" />
        Investor Preferences
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Founder Weight (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.founder_weight}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              founder_weight: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Market Weight (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.market_weight}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              market_weight: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Product Weight (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.product_weight}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              product_weight: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Traction Weight (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.traction_weight}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              traction_weight: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Finance Weight (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.finance_weight}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              finance_weight: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Risk Weight (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.risk_weight}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              risk_weight: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Overall Score</label>
          <input
            type="number"
            min="0"
            max="100"
            value={investorPreferences.min_overall_score}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              min_overall_score: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Risk Tolerance</label>
          <select
            value={investorPreferences.risk_tolerance}
            onChange={(e) => setInvestorPreferences({
              ...investorPreferences,
              risk_tolerance: e.target.value
            })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={saveInvestorPreferences}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Save Preferences
      </button>
    </div>
  );

  const renderComprehensiveResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        {/* Company Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {analysisResults.companyInfo?.companyName || 'Company Analysis'}
          </h2>
          <div className="flex items-center justify-center space-x-4 text-purple-200">
            <span>{analysisResults.companyInfo?.sector || 'Technology'}</span>
            <span>•</span>
            <span>{analysisResults.companyInfo?.stage || 'Early Stage'}</span>
            <span>•</span>
            <span>Founded {analysisResults.companyInfo?.foundedYear || 'Recently'}</span>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center shadow-2xl">
          <div className="text-6xl font-bold mb-2 animate-pulse">
            {(() => {
              const overallScore = analysisResults.overall_score;
              if (overallScore && overallScore > 0) return Math.round(overallScore);
              
              // Calculate from agent results if overall score is 0 or missing
              const agents = analysisResults.agent_results || {};
              const scores = Object.values(agents).map(agent => agent.score || 0);
              return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
            })()}/100
          </div>
          <div className="text-xl font-medium mb-2">Overall Investment Score</div>
          <div className="text-purple-200 mb-4">
            Analysis Confidence: {((analysisResults.overall_confidence || analysisResults.confidence || 0.9) * 100).toFixed(1)}%
          </div>
          <div className="mt-4 px-6 py-3 bg-white/20 rounded-full inline-block font-semibold text-lg">
            {analysisResults.investment_recommendation?.recommendation || 
             (analysisResults.overall_score >= 80 ? 'Strong Buy' :
              analysisResults.overall_score >= 70 ? 'Buy' :
              analysisResults.overall_score >= 60 ? 'Consider' : 'Caution')}
          </div>
        </div>

        {/* Agent Analysis Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(analysisResults.agent_results || {}).map(([agent, result]) => {
            const agentTitles = {
              founder: 'Founder Agent',
              market: 'Market Agent',
              product: 'Product Agent',
              traction: 'Traction Agent',
              finance: 'Finance Agent',
              risk: 'Risk Agent'
            };
            
            const icons = {
              founder: Users,
              market: TrendingUp,
              product: FileText,
              traction: BarChart3,
              finance: DollarSign,
              risk: AlertTriangle
            };
            
            const colors = {
              founder: '#f59e0b',
              market: '#ef4444',
              product: '#10b981',
              traction: '#10b981',
              finance: '#3b82f6',
              risk: '#ef4444'
            };
            
            const Icon = icons[agent] || FileText;
            const score = Math.round(result.score || 0);
            const color = colors[agent] || '#6b7280';
            const bgColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={agent} className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{agentTitles[agent] || agent}</h3>
                      <p className="text-sm text-gray-500">AI Analysis Complete</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-white font-bold ${bgColor}`}>
                    {score}/100
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        backgroundColor: color,
                        width: `${score}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {(() => {
                      const text = result.summary || result.detailed_analysis || `Comprehensive ${agent} analysis completed with detailed insights and scoring methodology.`;
                      // Clean and extract first 2-3 sentences
                      const cleaned = text
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/\*(.*?)\*/g, '$1')
                        .replace(/#{1,6}\s*/g, '')
                        .replace(/\n+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                      
                      const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
                      return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
                    })()} 
                  </p>
                </div>
                
                {/* Show key metrics if available */}
                {result.raw_metrics && Object.keys(result.raw_metrics).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.raw_metrics).slice(0, 4).map(([metric, value]) => (
                        <div key={metric} className="bg-gray-100 rounded p-2">
                          <div className="text-xs text-gray-500">{metric.replace(/_/g, ' ')}</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confidence: {((result.confidence || 0.8) * 100).toFixed(0)}%</span>
                  <span>GROQ LLM</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Investment Recommendation */}
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
            Investment Recommendation
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analysisResults.investment_recommendation?.recommendation || 'Processing...'}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {analysisResults.investment_recommendation?.rationale || 'Generating detailed recommendation...'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Success Probability</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {analysisResults.success_prediction?.success_percentage || '75%'}
                </div>
                <p className="text-purple-600 text-sm">
                  {analysisResults.success_prediction?.success_category || 'High Potential'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        {analysisResults.key_insights && analysisResults.key_insights.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              Key Insights
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {analysisResults.key_insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {analysisResults.next_steps && analysisResults.next_steps.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Recommended Next Steps
            </h3>
            <div className="space-y-3">
              {analysisResults.next_steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <p className="text-blue-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Investor Preferences */}
      {!isAnalyzing && !analysisResults && renderInvestorPreferences()}

      {!isAnalyzing && !analysisResults && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">

        
          <p className="text-gray-600 mb-4">
            Run comprehensive multi-agent analysis with data enrichment, benchmarking, and financial calculations.
          </p>
          <button
            onClick={startComprehensiveAnalysis}
            disabled={!uploadedFiles || uploadedFiles.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Start Comprehensive Analysis
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Analysis Progress</span>
              <span className="text-sm text-gray-600">{analysisProgress.toFixed(0)}%</span>
            </div>
            {renderProgressBar()}
            <p className="text-sm text-gray-600">{currentStep}</p>
          </div>
          {renderAnalysisSteps()}
        </div>
      )}

      {/* Comprehensive Results */}
      {analysisResults && renderComprehensiveResults()}
      
      {/* Action Buttons at Bottom */}
      {analysisResults && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mt-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={startComprehensiveAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Re-run Analysis
            </button>
            <button
              onClick={() => {
                setAnalysisResults(null);
                if (onAnalysisComplete) {
                  onAnalysisComplete(null);
                }
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Analyze New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAnalysis;