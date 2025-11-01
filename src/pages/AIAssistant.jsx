import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, MessageSquare, Zap } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI investment analyst assistant. I can help you understand startup analysis, explain scores, and provide investment insights. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call backend AI chat endpoint
      const response = await fetch('http://127.0.0.1:8000/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ message: currentInput })
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error('AI service unavailable');
      }
    } catch (error) {
      // Fallback to hardcoded response
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateAIResponse(currentInput),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }
    
    setIsTyping(false);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('score') || input.includes('rating')) {
      return "Investment scores are calculated using our multi-agent AI system that analyzes four key areas: Founder Profile (team experience, track record), Market Opportunity (size, growth, competition), Product Differentiation (unique value proposition, IP), and Business Metrics (revenue, growth, unit economics). Each area is scored 0-100, with the overall score being a weighted average.";
    }
    
    if (input.includes('founder') || input.includes('team')) {
      return "Founder analysis evaluates team experience, complementary skills, previous startup experience, domain expertise, and leadership capabilities. We look for founders with relevant industry experience, technical skills, and a track record of execution.";
    }
    
    if (input.includes('market') || input.includes('tam')) {
      return "Market analysis examines Total Addressable Market (TAM), market growth rate, competitive landscape, market timing, and barriers to entry. We prefer markets with $1B+ TAM, growing at 10%+ annually, with clear differentiation opportunities.";
    }
    
    if (input.includes('risk') || input.includes('concern')) {
      return "Common startup risks include market risk (demand uncertainty), execution risk (team ability to deliver), competitive risk (established players), regulatory risk (compliance requirements), and financial risk (funding runway). We assess each risk's probability and impact.";
    }
    
    if (input.includes('investment') || input.includes('recommend')) {
      return "Investment recommendations are based on overall score: 80+ = Strong Investment Opportunity, 60-79 = Consider Investment, 40-59 = Proceed with Caution, &lt;40 = High Risk. We also consider confidence levels, risk factors, and strategic fit.";
    }
    
    return "I can help you understand startup analysis, investment scoring, market evaluation, founder assessment, and risk analysis. Feel free to ask specific questions about any startup or investment topic! (Note: AI service currently unavailable, using fallback responses)";
  };

  const quickQuestions = [
    "How are investment scores calculated?",
    "What makes a strong founder profile?",
    "How do you assess market opportunity?",
    "What are common startup risks?",
    "Explain the recommendation criteria"
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Investment Assistant</h1>
            <p className="text-slate-400">Get insights about startup analysis and investment decisions</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30'
                    : 'bg-slate-700/50 border border-slate-600/50'
                }`}>
                  <p className="text-white">{message.content}</p>
                  <p className="text-slate-400 text-xs mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm mb-3">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(question)}
                  className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors border border-slate-600/50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about startup analysis, investment scoring, or any investment topic..."
              className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;