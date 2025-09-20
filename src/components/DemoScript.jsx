import React, { useState } from 'react';
import { Play, Clock, Users, DollarSign, TrendingUp, Zap } from 'lucide-react';

const DemoScript = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const demoSlides = [
    {
      title: "🎯 Opening Hook (30 seconds)",
      content: [
        "\"What if you could analyze 100 startups in the time it takes to review one?\"",
        "Show the problem: Traditional VC analysis takes 2-4 hours per startup",
        "Our AI does it in 15 minutes with higher accuracy"
      ],
      timing: "30s",
      icon: Zap
    },
    {
      title: "🚀 Live Demo (3 minutes)",
      content: [
        "Upload a pitch deck (use pre-prepared Uber deck)",
        "Show AI agents working in real-time",
        "Reveal comprehensive analysis results",
        "Export professional investment memo"
      ],
      timing: "3min",
      icon: Play
    },
    {
      title: "🎯 Differentiation (1 minute)",
      content: [
        "First multi-agent AI system for VC analysis",
        "Compare with existing solutions",
        "Highlight multi-agent architecture",
        "Show customization capabilities"
      ],
      timing: "1min",
      icon: TrendingUp
    },
    {
      title: "💰 Business Impact (30 seconds)",
      content: [
        "90% time reduction (4 hours → 15 minutes)",
        "80% cost savings for VC firms",
        "Infinite scalability",
        "Ready for 6-month pilot with Let's Venture"
      ],
      timing: "30s",
      icon: DollarSign
    }
  ];

  const keyTalkingPoints = [
    "\"First multi-agent AI system for VC analysis\"",
    "\"Professional investment memos in 15 minutes vs 4 hours\"",
    "\"Learns from investor preferences and improves over time\"",
    "\"Ready for 6-month pilot with Let's Venture\"",
    "\"$1.2M annual revenue potential with 50+ VCs ready to adopt\""
  ];

  const businessMetrics = [
    { label: "Time Reduction", value: "90%", color: "text-green-400" },
    { label: "Cost Savings", value: "80%", color: "text-blue-400" },
    { label: "Annual Revenue Potential", value: "$1.2M", color: "text-purple-400" },
    { label: "VCs Ready to Adopt", value: "50+", color: "text-yellow-400" },
    { label: "Investor Satisfaction", value: "94%", color: "text-pink-400" }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🏆 Hackathon Demo Script</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-300 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Demo Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📅 5-Minute Demo Flow</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoSlides.map((slide, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentSlide === idx
                    ? 'bg-purple-500/20 border-purple-400'
                    : 'bg-white/5 border-white/20 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <slide.icon className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 text-sm font-medium">{slide.timing}</span>
                </div>
                <h4 className="text-white font-medium text-sm">{slide.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Current Slide Details */}
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {React.createElement(demoSlides[currentSlide].icon, { className: "w-6 h-6 text-purple-400" })}
            <h3 className="text-xl font-semibold text-white">{demoSlides[currentSlide].title}</h3>
            <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm">
              {demoSlides[currentSlide].timing}
            </span>
          </div>
          <ul className="space-y-2">
            {demoSlides[currentSlide].content.map((point, idx) => (
              <li key={idx} className="text-purple-100 flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Talking Points */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">🎤 Key Talking Points</h3>
            <div className="space-y-3">
              {keyTalkingPoints.map((point, idx) => (
                <div key={idx} className="bg-white/5 rounded p-3">
                  <p className="text-purple-100 italic">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">📊 Business Metrics</h3>
            <div className="space-y-3">
              {businessMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 rounded p-3">
                  <span className="text-purple-200">{metric.label}</span>
                  <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">🗺️ Implementation Roadmap</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
              <h4 className="text-green-400 font-medium mb-2">Phase 1 (Months 1-3)</h4>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• MVP Development</li>
                <li>• Real document processing</li>
                <li>• ML model training</li>
                <li>• Pilot with 10 startups</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
              <h4 className="text-blue-400 font-medium mb-2">Phase 2 (Months 4-6)</h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Advanced AI features</li>
                <li>• Let's Venture integration</li>
                <li>• Mobile app development</li>
                <li>• 100+ startup pilot</li>
              </ul>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded p-4">
              <h4 className="text-purple-400 font-medium mb-2">Phase 3 (Months 7-12)</h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Full product launch</li>
                <li>• Customer acquisition</li>
                <li>• International expansion</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Tips */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
          <h3 className="text-yellow-400 font-semibold mb-3">💡 Demo Tips for Success</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2">Before Demo:</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• Have Uber pitch deck ready to upload</li>
                <li>• Test all animations and transitions</li>
                <li>• Practice timing (5 minutes total)</li>
                <li>• Prepare for Q&A about technical architecture</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">During Demo:</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• Start with the pain point hook</li>
                <li>• Show AI agents working in real-time</li>
                <li>• Highlight the 90% time reduction</li>
                <li>• End with "Ready for pilot program"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            ← Previous
          </button>
          <span className="text-purple-200">
            {currentSlide + 1} of {demoSlides.length}
          </span>
          <button
            onClick={() => setCurrentSlide(Math.min(demoSlides.length - 1, currentSlide + 1))}
            disabled={currentSlide === demoSlides.length - 1}
            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoScript;