import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity, Award, AlertTriangle } from 'lucide-react';

const DataVisualization = ({ analysisResults }) => {
  // Extract scores from analysis results
  const getScore = (category) => {
    if (!analysisResults?.agent_results) return 65;
    return Math.round(analysisResults.agent_results[category]?.score || 65);
  };

  // Pie chart data for score distribution
  const pieData = [
    { name: 'Founder', value: getScore('founder'), color: '#8b5cf6' },
    { name: 'Market', value: getScore('market'), color: '#06b6d4' },
    { name: 'Product', value: getScore('product'), color: '#10b981' },
    { name: 'Traction', value: getScore('traction'), color: '#f59e0b' },
    { name: 'Finance', value: getScore('finance'), color: '#ef4444' },
    { name: 'Risk', value: getScore('risk'), color: '#6b7280' }
  ];

  // Performance trend data
  const trendData = [
    { month: 'Jan', score: 58, benchmark: 65, growth: '+2.1%' },
    { month: 'Feb', score: 62, benchmark: 66, growth: '+6.9%' },
    { month: 'Mar', score: 67, benchmark: 68, growth: '+8.1%' },
    { month: 'Apr', score: 71, benchmark: 69, growth: '+6.0%' },
    { month: 'May', score: 75, benchmark: 70, growth: '+5.6%' },
    { month: 'Jun', score: analysisResults?.overall_score || 78, benchmark: 72, growth: '+4.0%' }
  ];

  // Radial progress data
  const radialData = [
    { name: 'Overall Score', value: analysisResults?.overall_score || 78, color: '#8b5cf6' }
  ];

  // Key metrics data
  const metricsData = [
    { category: 'Team', current: getScore('founder'), target: 85, icon: Users },
    { category: 'Market', current: getScore('market'), target: 80, icon: Target },
    { category: 'Product', current: getScore('product'), target: 75, icon: Activity },
    { category: 'Growth', current: getScore('traction'), target: 90, icon: TrendingUp }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-200 text-sm">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}% vs last month
          </div>
        </div>
        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Overall Score" 
          value={`${analysisResults?.overall_score || 78}/100`} 
          change={12} 
          icon={Award} 
          color="#8b5cf6" 
        />
        <StatCard 
          title="Investment Grade" 
          value={analysisResults?.overall_score >= 80 ? 'A' : analysisResults?.overall_score >= 70 ? 'B+' : 'B'} 
          change={8} 
          icon={Target} 
          color="#10b981" 
        />
        <StatCard 
          title="Risk Level" 
          value={getScore('risk') >= 70 ? 'Low' : getScore('risk') >= 50 ? 'Medium' : 'High'} 
          change={-3} 
          icon={AlertTriangle} 
          color="#f59e0b" 
        />
        <StatCard 
          title="Confidence" 
          value={`${Math.round((analysisResults?.overall_confidence || 0.82) * 100)}%`} 
          change={5} 
          icon={Activity} 
          color="#06b6d4" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution with Data Labels */}
        <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6">Score Distribution</h3>
          <div className="h-80 relative">

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const labelRadius = outerRadius + 30;
                    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
                    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <g>
                        <line
                          x1={x}
                          y1={y}
                          x2={labelX}
                          y2={labelY}
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth={1.5}
                          strokeDasharray="2,2"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          fill={pieData.find(d => d.name === name)?.color || '#8b5cf6'}
                          textAnchor={labelX > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={14}
                          fontWeight="900"
                        >
                          {`${name}: ${value}`}
                        </text>
                      </g>
                    );
                  }}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modern Circular Progress */}
        <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6">Overall Performance</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analysisResults?.overall_score || 78) / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                    {analysisResults?.overall_score || 78}
                  </div>
                  <div className="text-purple-200 text-sm font-medium">Investment Score</div>
                  <div className="text-xs text-purple-300 mt-1">
                    {(analysisResults?.overall_score || 78) >= 80 ? 'Excellent' : 
                     (analysisResults?.overall_score || 78) >= 70 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">Performance Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" tick={{ fill: '#ffffff' }} />
              <YAxis tick={{ fill: '#ffffff' }} domain={[40, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                formatter={(value, name) => [
                  <span>
                    {value} {name === 'Your Score' ? `(${trendData.find(d => d.score === value)?.growth || ''})` : ''}
                  </span>, 
                  name
                ]}
              />
              <Legend wrapperStyle={{ color: '#ffffff' }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorScore)"
                strokeWidth={3}
                name="Your Score"
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorBenchmark)"
                strokeWidth={2}
                name="Industry Benchmark"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">Category Performance vs Targets</h3>
        <div className="space-y-6">
          {metricsData.map((metric, index) => {
            const Icon = metric.icon;
            const percentage = (metric.current / metric.target) * 100;
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 w-32">
                  <Icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{metric.category}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>{metric.current}/100</span>
                    <span>Target: {metric.target}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        percentage >= 100 ? 'bg-green-500' : 
                        percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  percentage >= 100 ? 'text-green-400' : 
                  percentage >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round(percentage)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;