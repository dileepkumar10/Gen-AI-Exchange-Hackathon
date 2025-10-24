import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/Button';
import apiService from '../services/api';

const AIChatInterface = ({ analysisResults, isOpen, onToggle }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: "Hi! I'm your AI assistant. I can help explain the analysis results, answer questions about the startup evaluation, or provide insights about specific scores. What would you like to know?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Real AI response using GROQ API
    try {
      const context = analysisResults ? {
        overallScore: analysisResults.overallScore,
        founderScore: analysisResults.founderScore,
        marketScore: analysisResults.marketScore,
        differentiatorScore: analysisResults.differentiatorScore,
        metricsScore: analysisResults.metricsScore,
        companyName: analysisResults.companyInfo?.companyName
      } : null;

      const response = await apiService.sendChatMessage(inputValue, context);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback to local response
      const botResponse = generateContextualResponse(inputValue, analysisResults);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualResponse = (question, results) => {
    const lowerQuestion = question.toLowerCase();
    
    if (!results) {
      return "I don't have any analysis results to reference yet. Please run an analysis first, and then I can help explain the findings!";
    }

    // Score-related questions
    if (lowerQuestion.includes('score') || lowerQuestion.includes('rating')) {
      if (lowerQuestion.includes('founder')) {
        return `The founder profile scored ${results.founderScore}/100. This evaluates the team's experience, track record, and complementarity. ${results.founderScore >= 80 ? 'This is an excellent score indicating a strong founding team.' : results.founderScore >= 60 ? 'This is a good score with some areas for improvement.' : 'This score suggests significant concerns about the founding team.'}`;
      }
      if (lowerQuestion.includes('market')) {
        return `The market opportunity scored ${results.marketScore}/100. This assesses the total addressable market, growth potential, and competitive landscape. ${results.marketScore >= 80 ? 'This indicates a very attractive market opportunity.' : results.marketScore >= 60 ? 'This shows moderate market potential.' : 'This suggests limited market opportunity.'}`;
      }
      if (lowerQuestion.includes('differentiator') || lowerQuestion.includes('competitive')) {
        return `The unique differentiator scored ${results.differentiatorScore}/100. This evaluates the startup's competitive advantages, IP, and moats. ${results.differentiatorScore >= 80 ? 'Strong differentiation from competitors.' : results.differentiatorScore >= 60 ? 'Some competitive advantages identified.' : 'Limited differentiation detected.'}`;
      }
      if (lowerQuestion.includes('metrics') || lowerQuestion.includes('business')) {
        return `Business metrics scored ${results.metricsScore}/100. This covers revenue, growth rates, and unit economics. ${results.metricsScore >= 80 ? 'Excellent business performance metrics.' : results.metricsScore >= 60 ? 'Solid business metrics with room for growth.' : 'Business metrics need improvement.'}`;
      }
      return `The overall investment score is ${results.overallScore}/100, calculated from: Founder Profile (${results.founderScore}), Market Opportunity (${results.marketScore}), Differentiator (${results.differentiatorScore}), and Business Metrics (${results.metricsScore}).`;
    }

    // Risk-related questions
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('concern')) {
      if (results.riskFactors && results.riskFactors.length > 0) {
        return `Key risk factors identified: ${results.riskFactors.slice(0, 3).join(', ')}. These should be carefully considered in your investment decision.`;
      }
      return "The analysis identified several risk factors that are detailed in the investment memo. Would you like me to explain any specific area of concern?";
    }

    // Investment recommendation questions
    if (lowerQuestion.includes('invest') || lowerQuestion.includes('recommend')) {
      const recommendation = results.overallScore >= 80 ? 'Strong investment opportunity' : 
                           results.overallScore >= 60 ? 'Moderate investment potential with due diligence' : 
                           'High-risk investment requiring careful consideration';
      return `Based on the ${results.overallScore}/100 overall score, this appears to be a ${recommendation}. The analysis suggests ${results.nextSteps ? results.nextSteps[0] : 'conducting further due diligence'}.`;
    }

    // Company-specific questions
    if (lowerQuestion.includes('company') || lowerQuestion.includes('startup')) {
      return `This analysis covers ${results.companyInfo?.companyName || 'the startup'}, which operates in the ${results.companyInfo?.sector || 'identified sector'}. The company is at the ${results.companyInfo?.stage || 'current stage'} and was founded in ${results.companyInfo?.foundedYear || 'the specified year'}.`;
    }

    // Default contextual response
    const responses = [
      `Based on the analysis results, I can see this startup scored ${results.overallScore}/100 overall. What specific aspect would you like me to explain further?`,
      `The AI analysis evaluated four key areas: Founder Profile (${results.founderScore}), Market Opportunity (${results.marketScore}), Differentiator (${results.differentiatorScore}), and Business Metrics (${results.metricsScore}). Which area interests you most?`,
      `I have detailed insights from the investment memo. Would you like me to explain the scoring methodology, risk factors, or recommended next steps?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickPrompts = [
    "Explain this score",
    "What are the main risks?",
    "Should I invest?",
    "Compare to industry average",
    "What's the market opportunity?",
    "Tell me about the founders"
  ];

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed right-6 bottom-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl z-50 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-medium">AI Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/70 hover:text-white p-1 rounded"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="text-white/70 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-purple-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.type === 'user' ? 
                        <User className="w-3 h-3 text-white" /> : 
                        <Bot className="w-3 h-3 text-white" />
                      }
                    </div>
                    <div className={`px-3 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white/10 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInputValue(prompt)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about the analysis..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AIChatInterface;