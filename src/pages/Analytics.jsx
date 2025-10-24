import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, PieChart, Activity, 
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter
} from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock analytics data
  const performanceData = [
    { month: 'Jan', analyses: 45, avgScore: 78, successRate: 92 },
    { month: 'Feb', analyses: 52, avgScore: 82, successRate: 94 },
    { month: 'Mar', analyses: 48, avgScore: 75, successRate: 89 },
    { month: 'Apr', analyses: 61, avgScore: 85, successRate: 96 },
    { month: 'May', analyses: 58, avgScore: 88, successRate: 95 },
    { month: 'Jun', analyses: 67, avgScore: 91, successRate: 98 }
  ];

  const sectorAnalysis = [
    { name: 'FinTech', value: 35, analyses: 156, avgScore: 84, color: '#3B82F6' },
    { name: 'HealthTech', value: 28, analyses: 124, avgScore: 79, color: '#10B981' },
    { name: 'EdTech', value: 18, analyses: 89, avgScore: 82, color: '#F59E0B' },
    { name: 'SaaS', value: 25, analyses: 112, avgScore: 87, color: '#8B5CF6' },
    { name: 'E-commerce', value: 15, analyses: 67, avgScore: 76, color: '#EF4444' }
  ];

  const scoreDistribution = [
    { range: '90-100', count: 45, percentage: 12 },
    { range: '80-89', count: 89, percentage: 24 },
    { range: '70-79', count: 134, percentage: 36 },
    { range: '60-69', count: 78, percentage: 21 },
    { range: '50-59', count: 26, percentage: 7 }
  ];

  const riskAnalysis = [
    { risk: 'Market Risk', low: 45, medium: 89, high: 23 },
    { risk: 'Team Risk', low: 67, medium: 78, high: 12 },
    { risk: 'Product Risk', low: 56, medium: 89, high: 18 },
    { risk: 'Financial Risk', low: 34, medium: 98, high: 25 }
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {change && (
            <p className="text-green-400 text-sm mt-1">+{change}% vs last period</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${color.includes('blue') ? 'from-blue-500/20 to-blue-600/20' : 
          color.includes('green') ? 'from-green-500/20 to-green-600/20' :
          color.includes('purple') ? 'from-purple-500/20 to-purple-600/20' :
          'from-yellow-500/20 to-yellow-600/20'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Comprehensive analysis performance insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Analyses"
          value="2,847"
          change="18.2"
          icon={BarChart3}
          color="text-blue-400"
        />
        <MetricCard
          title="Average Score"
          value="84.2"
          change="5.7"
          icon={TrendingUp}
          color="text-green-400"
        />
        <MetricCard
          title="Success Rate"
          value="94.8%"
          change="2.3"
          icon={Activity}
          color="text-purple-400"
        />
        <MetricCard
          title="High Scores (80+)"
          value="67%"
          change="12.1"
          icon={PieChart}
          color="text-yellow-400"
        />
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="analyses" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Sector Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={sectorAnalysis}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {sectorAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Distribution and Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Risk Analysis</h3>
          <div className="space-y-4">
            {riskAnalysis.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{item.risk}</span>
                  <span className="text-slate-400">
                    {item.low + item.medium + item.high} analyses
                  </span>
                </div>
                <div className="flex h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(item.low / (item.low + item.medium + item.high)) * 100}%` }}
                  />
                  <div 
                    className="bg-yellow-500" 
                    style={{ width: `${(item.medium / (item.low + item.medium + item.high)) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(item.high / (item.low + item.medium + item.high)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Low: {item.low}</span>
                  <span>Medium: {item.medium}</span>
                  <span>High: {item.high}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Sector Analysis */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6">Sector Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 font-medium py-3">Sector</th>
                <th className="text-left text-slate-400 font-medium py-3">Analyses</th>
                <th className="text-left text-slate-400 font-medium py-3">Avg Score</th>
                <th className="text-left text-slate-400 font-medium py-3">Success Rate</th>
                <th className="text-left text-slate-400 font-medium py-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sectorAnalysis.map((sector, idx) => (
                <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="text-white font-medium">{sector.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-300">{sector.analyses}</td>
                  <td className="py-4">
                    <span className={`font-bold ${
                      sector.avgScore >= 85 ? 'text-green-400' :
                      sector.avgScore >= 75 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {sector.avgScore}
                    </span>
                  </td>
                  <td className="py-4 text-green-400">94.2%</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1 text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+5.2%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;