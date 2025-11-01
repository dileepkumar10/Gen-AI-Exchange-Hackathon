import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Lightbulb, DollarSign, BarChart3, Target, Award, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

const EnhancedDashboard = ({ analysisResults, isAnalyzing, currentStep }) => {
  // Trend data for floating bars
  const trendData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 72 },
    { month: 'Mar', score: 68 },
    { month: 'Apr', score: 78 },
    { month: 'May', score: 82 },
    { month: 'Jun', score: analysisResults?.overallScore || 85 },
  ];

  const MetricCard = ({ title, value, trend, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{title}</h3>
            <p className="text-purple-200 text-xs">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {Math.abs(trend)}%
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="w-16 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData.slice(-4)}>
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke={color} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );

  const FloatingBar = ({ label, value, maxValue, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm font-medium">{label}</span>
        <div className="flex items-center space-x-1">
          <span className="text-white text-sm">{value}</span>
          {trend && (
            <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({trend > 0 ? '+' : ''}{trend}%)
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / maxValue) * 100}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
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
          <h2 className="text-2xl font-bold text-white mb-4">AI Analysis in Progress</h2>
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / 4) * 100}%` }}
              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <p className="text-purple-200">Step {currentStep + 1} of 4 - Processing your data...</p>
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
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Investment Analysis Dashboard</h2>
            <p className="text-purple-200">{analysisResults.companyInfo?.companyName || 'Startup Analysis'}</p>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analysisResults.overallScore}</div>
                <div className="text-xs text-white/80">Score</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Founder Profile"
          value={analysisResults.founderScore}
          trend={5.2}
          icon={Users}
          color="#10b981"
          subtitle="Team Assessment"
        />
        <MetricCard
          title="Market Opportunity"
          value={analysisResults.marketScore}
          trend={-2.1}
          icon={Target}
          color="#3b82f6"
          subtitle="Market Analysis"
        />
        <MetricCard
          title="Differentiator"
          value={analysisResults.differentiatorScore}
          trend={8.7}
          icon={Lightbulb}
          color="#f59e0b"
          subtitle="Competitive Edge"
        />
        <MetricCard
          title="Business Metrics"
          value={analysisResults.metricsScore}
          trend={3.4}
          icon={DollarSign}
          color="#ef4444"
          subtitle="Financial Health"
        />
      </div>

      {/* Floating Progress Bars */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Performance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingBar
            label="Team Experience"
            value={analysisResults.founderScore}
            maxValue={100}
            color="#10b981"
            trend={5.2}
          />
          <FloatingBar
            label="Market Size"
            value={analysisResults.marketScore}
            maxValue={100}
            color="#3b82f6"
            trend={-2.1}
          />
          <FloatingBar
            label="Innovation Level"
            value={analysisResults.differentiatorScore}
            maxValue={100}
            color="#f59e0b"
            trend={8.7}
          />
          <FloatingBar
            label="Revenue Potential"
            value={analysisResults.metricsScore}
            maxValue={100}
            color="#ef4444"
            trend={3.4}
          />
        </div>
      </motion.div>

      {/* Line Chart for Trend Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Score Trend Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" tick={{ fill: '#ffffff' }} />
              <YAxis tick={{ fill: '#ffffff' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }} />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart for Metrics Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance vs Industry Average</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Founder Profile', current: analysisResults.founderScore, average: 72 },
              { name: 'Market Opportunity', current: analysisResults.marketScore, average: 68 },
              { name: 'Differentiator', current: analysisResults.differentiatorScore, average: 75 },
              { name: 'Business Metrics', current: analysisResults.metricsScore, average: 70 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 11 }} />
              <YAxis tick={{ fill: '#ffffff' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }} />
              <Legend />
              <Bar dataKey="current" fill="#8b5cf6" name="Current Score" radius={[4, 4, 0, 0]} />
              <Bar dataKey="average" fill="#6b7280" name="Industry Average" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Risk Assessment */}
      {analysisResults.riskFactors && analysisResults.riskFactors.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-red-500/10 backdrop-blur-md rounded-xl p-6 border border-red-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Risk Factors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisResults.riskFactors.slice(0, 4).map((risk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start space-x-2 bg-red-500/5 rounded-lg p-3"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-red-200 text-sm">{risk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Investment Recommendation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-green-400" />
          Investment Recommendation
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-lg font-medium">
              {analysisResults.overallScore >= 80 ? 'Strong Buy' : 
               analysisResults.overallScore >= 60 ? 'Moderate Buy' : 'High Risk'}
            </p>
            <p className="text-green-200 text-sm">
              Based on comprehensive AI analysis of {analysisResults.companyInfo?.companyName || 'the startup'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{analysisResults.overallScore}%</div>
            <div className="text-xs text-green-300">Confidence</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;