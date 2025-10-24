import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const DataVisualization = ({ analysisResults, trendData = [], comparisonData = [] }) => {
  // Radar chart data for multi-agent scoring
  const radarData = analysisResults ? [
    { subject: 'Founder', score: analysisResults.founderScore, fullMark: 100 },
    { subject: 'Market', score: analysisResults.marketScore, fullMark: 100 },
    { subject: 'Differentiator', score: analysisResults.differentiatorScore, fullMark: 100 },
    { subject: 'Metrics', score: analysisResults.metricsScore, fullMark: 100 },
  ] : [];

  // Sample trend data if none provided
  const defaultTrendData = [
    { name: 'Jan', score: 65 },
    { name: 'Feb', score: 72 },
    { name: 'Mar', score: 68 },
    { name: 'Apr', score: 78 },
    { name: 'May', score: 82 },
    { name: 'Jun', score: analysisResults?.overallScore || 85 },
  ];

  // Sample comparison data if none provided
  const defaultComparisonData = [
    { name: 'Founder Profile', current: analysisResults?.founderScore || 85, average: 72 },
    { name: 'Market Opportunity', current: analysisResults?.marketScore || 78, average: 68 },
    { name: 'Differentiator', current: analysisResults?.differentiatorScore || 82, average: 75 },
    { name: 'Business Metrics', current: analysisResults?.metricsScore || 76, average: 70 },
  ];

  const useTrendData = trendData.length > 0 ? trendData : defaultTrendData;
  const useComparisonData = comparisonData.length > 0 ? comparisonData : defaultComparisonData;

  return (
    <div className="space-y-8">
      {/* Radar Chart for Multi-Agent Scoring */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Multi-Agent Analysis Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#ffffff80', fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Line Chart for Trend Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Score Trend Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={useTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff' }} />
              <YAxis tick={{ fill: '#ffffff' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart for Metrics Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Performance vs Industry Average</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={useComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 11 }} />
              <YAxis tick={{ fill: '#ffffff' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="current" fill="#8b5cf6" name="Current Score" radius={[4, 4, 0, 0]} />
              <Bar dataKey="average" fill="#6b7280" name="Industry Average" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default DataVisualization;