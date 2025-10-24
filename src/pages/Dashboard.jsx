import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, Target, 
  BarChart3, Activity, Zap, Award,
  ArrowUp, ArrowDown, Eye
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data for charts
  const analysisData = [
    { date: '2024-01-01', analyses: 12, success: 94, avgScore: 78 },
    { date: '2024-01-02', analyses: 18, success: 96, avgScore: 82 },
    { date: '2024-01-03', analyses: 15, success: 91, avgScore: 75 },
    { date: '2024-01-04', analyses: 22, success: 98, avgScore: 85 },
    { date: '2024-01-05', analyses: 28, success: 95, avgScore: 88 },
    { date: '2024-01-06', analyses: 25, success: 93, avgScore: 79 },
    { date: '2024-01-07', analyses: 31, success: 97, avgScore: 91 }
  ];

  const radarData = [
    { subject: 'Founder', A: 85, B: 78, fullMark: 100 },
    { subject: 'Market', A: 92, B: 85, fullMark: 100 },
    { subject: 'Product', A: 78, B: 88, fullMark: 100 },
    { subject: 'Traction', A: 88, B: 75, fullMark: 100 },
    { subject: 'Financials', A: 75, B: 82, fullMark: 100 },
    { subject: 'Team', A: 90, B: 79, fullMark: 100 }
  ];

  const sectorData = [
    { name: 'FinTech', value: 35, color: '#3B82F6' },
    { name: 'HealthTech', value: 28, color: '#10B981' },
    { name: 'EdTech', value: 18, color: '#F59E0B' },
    { name: 'SaaS', value: 25, color: '#8B5CF6' },
    { name: 'E-commerce', value: 15, color: '#EF4444' }
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
              {trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
              <span>{change}</span>
            </div>
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

  const RecentAnalysis = ({ analyses }) => (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Analyses</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {analyses.map((analysis, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{analysis.company[0]}</span>
              </div>
              <div>
                <h4 className="text-white font-medium">{analysis.company}</h4>
                <p className="text-slate-400 text-sm">{analysis.sector} • {analysis.date}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  analysis.score >= 80 ? 'text-green-400' :
                  analysis.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analysis.score}
                </div>
                <div className="text-slate-400 text-xs">Score</div>
              </div>
              <button className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const recentAnalyses = [
    { company: 'TechFlow AI', sector: 'AI/ML', date: '2 hours ago', score: 92 },
    { company: 'GreenEnergy Solutions', sector: 'CleanTech', date: '4 hours ago', score: 78 },
    { company: 'FinanceBot', sector: 'FinTech', date: '6 hours ago', score: 85 },
    { company: 'HealthTracker Pro', sector: 'HealthTech', date: '1 day ago', score: 71 },
    { company: 'EduPlatform', sector: 'EdTech', date: '1 day ago', score: 88 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">AI-powered venture capital analysis overview</p>
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
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Analyses"
          value="1,247"
          change="+12.5%"
          trend="up"
          icon={BarChart3}
          color="text-blue-400"
        />
        <MetricCard
          title="Success Rate"
          value="94.2%"
          change="+2.1%"
          trend="up"
          icon={Target}
          color="text-green-400"
        />
        <MetricCard
          title="Avg Score"
          value="82.5"
          change="+5.3"
          trend="up"
          icon={TrendingUp}
          color="text-purple-400"
        />
        <MetricCard
          title="Active Users"
          value="156"
          change="+8.7%"
          trend="up"
          icon={Users}
          color="text-yellow-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Trend */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Analysis Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analysisData}>
              <defs>
                <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="analyses" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorAnalyses)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Sector Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart and Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Performance Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF' }} />
              <PolarRadiusAxis tick={{ fill: '#9CA3AF' }} />
              <Radar 
                name="Current" 
                dataKey="A" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.2} 
              />
              <Radar 
                name="Previous" 
                dataKey="B" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.2} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Analyses */}
        <RecentAnalysis analyses={recentAnalyses} />
      </div>

      {/* AI Status */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">AI System Status</h3>
              <p className="text-slate-300">All systems operational • Last updated 2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">1.2s</div>
              <div className="text-slate-400 text-sm">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">156</div>
              <div className="text-slate-400 text-sm">Queue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;