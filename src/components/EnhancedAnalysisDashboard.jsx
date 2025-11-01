import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Lightbulb, DollarSign, BarChart3, Wifi, WifiOff } from 'lucide-react';
import DataVisualization from './DataVisualization';
import AIChatInterface from './AIChatInterface';
import useAnalysisProgress from '../hooks/useAnalysisProgress';

const EnhancedAnalysisDashboard = ({ analysisResults: propAnalysisResults, isAnalyzing: propIsAnalyzing, currentStep: propCurrentStep, userId }) => {
  const [showChat, setShowChat] = useState(false);
  
  // Use WebSocket-based progress tracking
  const {
    isConnected,
    currentStep: wsCurrentStep,
    stepName,
    stepMessage,
    progress,
    confidence,
    isAnalyzing: wsIsAnalyzing,
    steps: wsSteps,
    analysisResults: wsAnalysisResults,
    error: wsError,
    resetProgress
  } = useAnalysisProgress(userId);
  
  // Use WebSocket data if available, fallback to props
  const isAnalyzing = wsIsAnalyzing || propIsAnalyzing;
  const currentStep = wsCurrentStep !== undefined ? wsCurrentStep : (propCurrentStep || 0);
  const analysisResults = wsAnalysisResults || propAnalysisResults;
  const aiSteps = wsSteps.length > 0 ? wsSteps : [
    { name: "Data Extraction Agent", icon: "📄", description: "Parsing documents..." },
    { name: "Public Data Agent", icon: "🌐", description: "Gathering market intel..." },
    { name: "Analysis Agent", icon: "📊", description: "Computing scores..." },
    { name: "Memo Generation Agent", icon: "📝", description: "Creating report..." }
  ];

  // Animated Score Card Component with Framer Motion
  const AnimatedScoreCard = ({ title, finalScore, icon: Icon, color, delay }) => {
    const [currentScore, setCurrentScore] = React.useState(0);

    React.useEffect(() => {
      setCurrentScore(0);

      const timer = setTimeout(() => {
        let intervalId = setInterval(() => {
          setCurrentScore(prev => {
            if (prev >= finalScore) {
              clearInterval(intervalId);
              return finalScore;
            }
            return Math.min(prev + 2, finalScore);
          });
        }, 50);
      }, delay);

      return () => clearTimeout(timer);
    }, [finalScore, delay]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay / 1000 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay / 1000 + 0.2 }}
              className="p-3 rounded-full"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </motion.div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-purple-200">AI Analysis Score</p>
            </div>
          </div>
          <div className="text-right">
            <motion.div
              className="text-3xl font-bold"
              style={{ color }}
              key={currentScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {currentScore}
            </motion.div>
            <div className="w-16 h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${currentScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-8">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-md rounded-lg px-3 py-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">Real-time Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur-md rounded-lg px-3 py-2">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">Offline Mode</span>
            </div>
          )}
          {wsError && (
            <div className="bg-red-500/20 backdrop-blur-md rounded-lg px-3 py-2">
              <span className="text-red-300 text-sm">{wsError}</span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <BarChart3 className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-4">
            {stepName || 'AI Agents Working...'}
          </h2>
          
          {/* Current Step Message */}
          {stepMessage && (
            <p className="text-purple-200 mb-6 text-center">{stepMessage}</p>
          )}
          
          {/* Confidence Indicator */}
          {confidence && (
            <div className="mb-4 text-center">
              <span className="text-purple-200 text-sm">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>
          )}

          {/* Progress Steps - Single Row */}
          <div className="flex items-center justify-center space-x-4 mb-8 overflow-x-auto">
            {aiSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: index <= currentStep ? 1 : 0.8,
                    opacity: index <= currentStep ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col items-center p-4 rounded-lg min-w-[120px] ${index === currentStep ? 'bg-purple-500/20 border border-purple-500/30' :
                      index < currentStep ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'
                    }`}
                >
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <h3 className="font-semibold text-white text-sm text-center">{step.name}</h3>
                  <p className="text-purple-200 text-xs text-center mt-1">{step.description}</p>

                  {/* Status Indicator */}
                  <div className="mt-2">
                    {index < currentStep && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {index === currentStep && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
                      />
                    )}
                    {index > currentStep && (
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    )}
                  </div>
                </motion.div>

                {/* Connector Line */}
                {index < aiSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-white/20'
                    }`}></div>
                )}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress || ((currentStep + 1) / aiSteps.length) * 100}%` }}
            className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"
            style={{ maxWidth: '300px' }}
          />
          <p className="text-purple-200 mt-2">
            Step {currentStep + 1} of {aiSteps.length} - {Math.round(progress || ((currentStep + 1) / aiSteps.length) * 100)}% Complete
          </p>
        </motion.div>
      </div>
    );
  }

  if (!analysisResults) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
        <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Analysis Available</h3>
        <p className="text-purple-200">Upload documents and run analysis to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">


      {/* Header with Company Details */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {analysisResults.companyInfo?.companyName || 'Uber Technologies'}
            </h2>
            <div className="flex items-center space-x-4 text-purple-200">
              <span>{analysisResults.companyInfo?.sector || 'Transportation Technology'}</span>
              <span>•</span>
              <span>{analysisResults.companyInfo?.stage || 'Series A'}</span>
              <span>•</span>
              <span>Founded {analysisResults.companyInfo?.foundedYear || '2009'}</span>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analysisResults.overallScore}</div>
              <div className="text-xs text-white/80">Score</div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Investment Recommendation</h4>
            <p className="text-purple-200 text-sm">
              {analysisResults.overallScore >= 80 ? 'Strong Buy - High potential startup with excellent fundamentals' :
                analysisResults.overallScore >= 60 ? 'Moderate Buy - Good opportunity with some areas for improvement' :
                  'High Risk - Significant concerns identified in analysis'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Key Strengths</h4>
            <p className="text-purple-200 text-sm">
              {analysisResults.founderScore >= analysisResults.marketScore ? 'Strong founding team with proven track record' : 'Large market opportunity with growth potential'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Risk Level</h4>
            <p className="text-purple-200 text-sm">
              {analysisResults.overallScore >= 80 ? 'Low Risk' :
                analysisResults.overallScore >= 60 ? 'Medium Risk' : 'High Risk'} investment based on comprehensive analysis
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Analysis Confidence</h4>
            <p className="text-purple-200 text-sm">
              {Math.round((analysisResults.founderConfidence || 0.85) * 100)}% confidence in AI analysis based on available data
            </p>
          </div>
        </div>
      </motion.div>



      {/* Animated Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedScoreCard
          title="Founder Profile"
          finalScore={analysisResults.founderScore}
          icon={Users}
          color="#10b981"
          delay={200}
        />
        <AnimatedScoreCard
          title="Market Opportunity"
          finalScore={analysisResults.marketScore}
          icon={TrendingUp}
          color="#3b82f6"
          delay={400}
        />
        <AnimatedScoreCard
          title="Differentiator"
          finalScore={analysisResults.differentiatorScore}
          icon={Lightbulb}
          color="#f59e0b"
          delay={600}
        />
        <AnimatedScoreCard
          title="Business Metrics"
          finalScore={analysisResults.metricsScore}
          icon={DollarSign}
          color="#ef4444"
          delay={800}
        />
      </div>



      {/* Risk Factors */}
      {analysisResults.riskFactors && analysisResults.riskFactors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="bg-red-500/10 backdrop-blur-md rounded-xl p-6 border border-red-500/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
            Risk Factors - {analysisResults.companyInfo?.companyName || 'Uber Technologies'}
          </h3>
          <div className="mb-3">
            <p className="text-red-200 text-sm">
              AI-identified potential risks for investment consideration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisResults.riskFactors.slice(0, 4).map((risk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.5 + index * 0.1 }}
                className="flex items-start space-x-2 bg-red-500/5 rounded-lg p-3"
              >
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold text-xs flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-red-200 text-sm">{risk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Investment Recommendation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-8 border border-green-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
          Investment Recommendation
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recommendation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-xl font-semibold text-white mb-3">
                {analysisResults.overallScore >= 80 ? 'Strong Buy Recommendation' :
                  analysisResults.overallScore >= 60 ? 'Moderate Buy Recommendation' : 'High Risk Investment'}
              </h4>
              <p className="text-green-200 text-lg leading-relaxed mb-4">
                {analysisResults.overallScore >= 80 ?
                  `${analysisResults.companyInfo?.companyName || 'This company'} presents an exceptional investment opportunity with strong fundamentals across all key metrics. The combination of experienced leadership, large market opportunity, and solid business metrics makes this a compelling investment.` :
                  analysisResults.overallScore >= 60 ?
                    `${analysisResults.companyInfo?.companyName || 'This company'} shows promising potential with good fundamentals in most areas. While there are some areas for improvement, the overall trajectory and market position suggest a solid investment opportunity.` :
                    `${analysisResults.companyInfo?.companyName || 'This company'} presents significant risks that require careful consideration. Several key areas need substantial improvement before this becomes a viable investment opportunity.`
                }
              </p>
            </div>

            {/* Key Investment Factors */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3">Why Invest - Key Factors</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Growth Potential
                  </h5>
                  <p className="text-purple-200 text-sm">
                    {analysisResults.marketScore >= 75 ?
                      'Large addressable market with significant growth opportunities and expanding user base.' :
                      'Moderate market opportunity with potential for strategic expansion and growth.'}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    Team Strength
                  </h5>
                  <p className="text-purple-200 text-sm">
                    {analysisResults.founderScore >= 75 ?
                      'Experienced founding team with proven track record and complementary skills.' :
                      'Founding team shows potential with room for strategic additions and development.'}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    Unique Advantage
                  </h5>
                  <p className="text-purple-200 text-sm">
                    {analysisResults.differentiatorScore >= 75 ?
                      'Strong competitive moats and unique value proposition that differentiates from competitors.' :
                      'Developing competitive advantages with potential for market differentiation.'}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Financial Health
                  </h5>
                  <p className="text-purple-200 text-sm">
                    {analysisResults.metricsScore >= 75 ?
                      'Strong revenue growth and healthy unit economics with clear path to profitability.' :
                      'Developing financial metrics with focus on sustainable growth and efficiency.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-white/5 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-400 mb-2">{analysisResults.overallScore}</div>
              <div className="text-sm text-green-300">Overall Investment Score</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">Founder Profile</span>
                <span className="text-white font-medium">{analysisResults.founderScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">Market Opportunity</span>
                <span className="text-white font-medium">{analysisResults.marketScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">Differentiator</span>
                <span className="text-white font-medium">{analysisResults.differentiatorScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">Business Metrics</span>
                <span className="text-white font-medium">{analysisResults.metricsScore}/100</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-1">
                  {analysisResults.overallScore >= 80 ? 'STRONG BUY' :
                    analysisResults.overallScore >= 60 ? 'MODERATE BUY' : 'HIGH RISK'}
                </div>
                <div className="text-xs text-green-300">
                  AI Confidence: {Math.round((analysisResults.founderConfidence || 0.85) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Chat Interface */}
      <AIChatInterface
        analysisResults={analysisResults}
        isOpen={showChat}
        onToggle={() => setShowChat(!showChat)}
      />
    </div>
  );
};

export default EnhancedAnalysisDashboard;