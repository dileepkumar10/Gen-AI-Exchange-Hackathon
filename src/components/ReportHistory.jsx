import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Filter, Search, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    founderScore: 'all',
    marketScore: 'all',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const mockReports = [
    {
      id: 1,
      companyName: 'TechStart AI',
      date: '2024-01-15',
      overallScore: 85,
      founderScore: 88,
      marketScore: 82,
      differentiatorScore: 87,
      metricsScore: 83,
      status: 'completed'
    },
    {
      id: 2,
      companyName: 'GreenTech Solutions',
      date: '2024-01-14',
      overallScore: 72,
      founderScore: 75,
      marketScore: 68,
      differentiatorScore: 74,
      metricsScore: 71,
      status: 'completed'
    },
    {
      id: 3,
      companyName: 'FinanceFlow',
      date: '2024-01-13',
      overallScore: 91,
      founderScore: 94,
      marketScore: 89,
      differentiatorScore: 92,
      metricsScore: 88,
      status: 'completed'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports);
      setFilteredReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...reports];

    // Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(report => new Date(report.date) >= cutoff);
    }

    // Score filters
    if (filters.founderScore !== 'all') {
      const [min, max] = filters.founderScore.split('-').map(Number);
      filtered = filtered.filter(report => report.founderScore >= min && report.founderScore <= max);
    }

    if (filters.marketScore !== 'all') {
      const [min, max] = filters.marketScore.split('-').map(Number);
      filtered = filtered.filter(report => report.marketScore >= min && report.marketScore <= max);
    }

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(report => 
        report.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [filters, reports]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white">Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Report History</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          {/* Founder Score Filter */}
          <select
            value={filters.founderScore}
            onChange={(e) => setFilters(prev => ({ ...prev, founderScore: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Founder Scores</option>
            <option value="80-100">80-100 (Excellent)</option>
            <option value="60-79">60-79 (Good)</option>
            <option value="0-59">0-59 (Fair)</option>
          </select>

          {/* Market Score Filter */}
          <select
            value={filters.marketScore}
            onChange={(e) => setFilters(prev => ({ ...prev, marketScore: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Market Scores</option>
            <option value="80-100">80-100 (Excellent)</option>
            <option value="60-79">60-79 (Good)</option>
            <option value="0-59">0-59 (Fair)</option>
          </select>
        </div>

        {/* Results Count */}
        <p className="text-purple-200 text-sm">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{report.companyName}</h3>
                  <div className="flex items-center space-x-2 text-sm text-purple-200">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                    {report.overallScore}
                  </div>
                  <div className="text-xs text-purple-200">Overall</div>
                </div>

                {/* Individual Scores */}
                <div className="hidden md:flex space-x-4">
                  {[
                    { label: 'Founder', score: report.founderScore },
                    { label: 'Market', score: report.marketScore },
                    { label: 'Differentiator', score: report.differentiatorScore },
                    { label: 'Metrics', score: report.metricsScore }
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center">
                      <div className={`px-2 py-1 rounded text-sm font-semibold ${getScoreBg(score)} ${getScoreColor(score)}`}>
                        {score}
                      </div>
                      <div className="text-xs text-purple-200 mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="text-white hover:bg-white/10 p-2 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-white hover:bg-white/10 p-2 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-red-400 hover:bg-red-500/10 p-2 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
          <p className="text-purple-200">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;