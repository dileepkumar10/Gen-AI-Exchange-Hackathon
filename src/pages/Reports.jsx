import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Eye, Filter, Search, 
  Calendar, Star, TrendingUp, Users, DollarSign
} from 'lucide-react';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock reports data
  const reports = [
    {
      id: 1,
      companyName: 'TechFlow AI',
      sector: 'AI/ML',
      overallScore: 92,
      date: '2024-01-15',
      analyst: 'John Smith',
      status: 'completed',
      recommendation: 'Strong Investment',
      founderScore: 88,
      marketScore: 95,
      productScore: 90,
      tractionScore: 94
    },
    {
      id: 2,
      companyName: 'GreenEnergy Solutions',
      sector: 'CleanTech',
      overallScore: 78,
      date: '2024-01-14',
      analyst: 'Sarah Johnson',
      status: 'completed',
      recommendation: 'Consider Investment',
      founderScore: 82,
      marketScore: 75,
      productScore: 80,
      tractionScore: 76
    },
    {
      id: 3,
      companyName: 'FinanceBot Pro',
      sector: 'FinTech',
      overallScore: 85,
      date: '2024-01-13',
      analyst: 'Mike Chen',
      status: 'completed',
      recommendation: 'Strong Investment',
      founderScore: 90,
      marketScore: 82,
      productScore: 88,
      tractionScore: 80
    },
    {
      id: 4,
      companyName: 'HealthTracker',
      sector: 'HealthTech',
      overallScore: 71,
      date: '2024-01-12',
      analyst: 'Emily Davis',
      status: 'completed',
      recommendation: 'Proceed with Caution',
      founderScore: 75,
      marketScore: 68,
      productScore: 72,
      tractionScore: 69
    },
    {
      id: 5,
      companyName: 'EduPlatform',
      sector: 'EdTech',
      overallScore: 88,
      date: '2024-01-11',
      analyst: 'David Wilson',
      status: 'completed',
      recommendation: 'Strong Investment',
      founderScore: 92,
      marketScore: 85,
      productScore: 87,
      tractionScore: 88
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'high' && report.overallScore >= 80) ||
                         (filterBy === 'medium' && report.overallScore >= 60 && report.overallScore < 80) ||
                         (filterBy === 'low' && report.overallScore < 60);
    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'Strong Investment') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (recommendation === 'Consider Investment') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const viewReport = (report) => {
    // Create detailed view modal or navigate to detailed page
    const reportDetails = `
INVESTMENT ANALYSIS REPORT

Company: ${report.companyName}
Sector: ${report.sector}
Overall Score: ${report.overallScore}/100
Recommendation: ${report.recommendation}

SCORE BREAKDOWN:
- Founder Profile: ${report.founderScore}/100
- Market Opportunity: ${report.marketScore}/100
- Product/Service: ${report.productScore}/100
- Traction/Metrics: ${report.tractionScore}/100

Analyst: ${report.analyst}
Date: ${new Date(report.date).toLocaleDateString()}

DETAILED ANALYSIS:

Founder Profile (${report.founderScore}/100):
Strong founding team with complementary skills and relevant industry experience. Previous startup experience and technical expertise in the sector.

Market Opportunity (${report.marketScore}/100):
Large addressable market with strong growth potential. Clear market need and favorable competitive positioning.

Product/Service (${report.productScore}/100):
Innovative solution with clear differentiation. Strong product-market fit indicators and positive customer feedback.

Traction/Metrics (${report.tractionScore}/100):
Solid early traction with growing revenue and user base. Positive unit economics and scalable business model.

RISK FACTORS:
- Market competition from established players
- Execution risk in scaling operations
- Regulatory considerations in the sector

RECOMMENDATION:
${report.recommendation} - The startup shows strong potential across key evaluation criteria.
    `;
    
    alert(reportDetails);
  };

  const exportReport = (report) => {
    // Create and download PDF report
    const reportContent = `Investment Analysis Report

Company: ${report.companyName}
Sector: ${report.sector}
Date: ${new Date(report.date).toLocaleDateString()}
Analyst: ${report.analyst}

OVERALL SCORE: ${report.overallScore}/100
RECOMMENDATION: ${report.recommendation}

DETAILED SCORES:
- Founder Profile: ${report.founderScore}/100
- Market Opportunity: ${report.marketScore}/100
- Product/Service: ${report.productScore}/100
- Traction/Metrics: ${report.tractionScore}/100

This analysis was generated by AI Startup Analyst.`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.companyName}_Investment_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    const allReportsContent = filteredReports.map(report => 
      `Company: ${report.companyName} | Score: ${report.overallScore} | Recommendation: ${report.recommendation} | Date: ${new Date(report.date).toLocaleDateString()}`
    ).join('\n');
    
    const content = `AI Startup Analyst - All Reports Export\n\nGenerated: ${new Date().toLocaleDateString()}\nTotal Reports: ${filteredReports.length}\n\n${allReportsContent}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `All_Investment_Reports_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Investment Reports</h1>
          <p className="text-slate-400 mt-1">View and manage all investment analysis reports</p>
        </div>
        
        <button 
          onClick={() => exportAllReports()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export All</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies or sectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Scores</option>
            <option value="high">High (80+)</option>
            <option value="medium">Medium (60-79)</option>
            <option value="low">Low (Below 60)</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="company">Sort by Company</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{report.companyName}</h3>
                <p className="text-slate-400 text-sm">{report.sector}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <div className="text-slate-400 text-xs">Overall Score</div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 text-sm">Founder: {report.founderScore}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 text-sm">Market: {report.marketScore}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300 text-sm">Product: {report.productScore}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-slate-300 text-sm">Traction: {report.tractionScore}</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getRecommendationColor(report.recommendation)}`}>
              {report.recommendation}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
              <span>By {report.analyst}</span>
              <span>{new Date(report.date).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button 
                onClick={() => viewReport(report)}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button 
                onClick={() => exportReport(report)}
                className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{reports.length}</div>
            <div className="text-slate-400 text-sm">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {reports.filter(r => r.overallScore >= 80).length}
            </div>
            <div className="text-slate-400 text-sm">High Scores</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)}
            </div>
            <div className="text-slate-400 text-sm">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {reports.filter(r => r.recommendation === 'Strong Investment').length}
            </div>
            <div className="text-slate-400 text-sm">Recommended</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;