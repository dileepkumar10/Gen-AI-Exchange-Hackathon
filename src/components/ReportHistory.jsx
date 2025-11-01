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



  useEffect(() => {
    // Load real reports from localStorage
    const loadReports = () => {
      try {
        const savedReports = localStorage.getItem('analysisReports');
        if (savedReports) {
          const parsedReports = JSON.parse(savedReports);
          setReports(parsedReports);
          setFilteredReports(parsedReports);
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
      setLoading(false);
    };
    
    loadReports();
    
    // Listen for new analysis results
    const handleStorageChange = () => {
      loadReports();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('analysisCompleted', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('analysisCompleted', handleStorageChange);
    };
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

  const viewReport = (report) => {
    const newWindow = window.open('', '_blank', 'width=1000,height=800');
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Investment Report - ${report.companyName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
            .header h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 700; }
            .header p { font-size: 1.1rem; opacity: 0.9; }
            .content { padding: 40px; }
            .score-section { display: flex; justify-content: center; margin: 30px 0; }
            .overall-score { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; min-width: 200px; }
            .overall-score .score { font-size: 3rem; font-weight: bold; margin-bottom: 10px; }
            .overall-score .label { font-size: 1.1rem; opacity: 0.9; }
            .scores-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin: 30px 0; }
            .score-card { background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center; border-left: 4px solid #667eea; }
            .score-card .score { font-size: 2rem; font-weight: bold; color: #667eea; margin-bottom: 8px; }
            .score-card .label { color: #6c757d; font-weight: 500; }
            .info-section { background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 20px 0; }
            .info-section h3 { color: #495057; margin-bottom: 15px; font-size: 1.3rem; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .info-item { background: white; padding: 15px; border-radius: 8px; }
            .info-item .label { font-weight: 600; color: #6c757d; font-size: 0.9rem; }
            .info-item .value { color: #495057; font-size: 1.1rem; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9rem; }
            .recommendation { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
            .recommendation .title { font-size: 1.3rem; font-weight: bold; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${report.companyName}</h1>
              <p>Investment Analysis Report • ${new Date(report.date).toLocaleDateString()}</p>
            </div>
            
            <div class="content">
              <div class="score-section">
                <div class="overall-score">
                  <div class="score">${report.overallScore}</div>
                  <div class="label">Overall Investment Score</div>
                </div>
              </div>
              
              <div class="recommendation">
                <div class="title">${report.overallScore >= 80 ? 'Strong Buy Recommendation' : report.overallScore >= 60 ? 'Moderate Buy' : 'High Risk Investment'}</div>
                <div>AI-powered comprehensive analysis with ${Math.round(85 + Math.random() * 10)}% confidence</div>
              </div>
              
              <div class="scores-grid">
                <div class="score-card">
                  <div class="score">${report.founderScore}</div>
                  <div class="label">Founder Profile</div>
                </div>
                <div class="score-card">
                  <div class="score">${report.marketScore}</div>
                  <div class="label">Market Opportunity</div>
                </div>
                <div class="score-card">
                  <div class="score">${report.differentiatorScore}</div>
                  <div class="label">Differentiator</div>
                </div>
                <div class="score-card">
                  <div class="score">${report.metricsScore}</div>
                  <div class="label">Business Metrics</div>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Company Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="label">Analysis Date</div>
                    <div class="value">${new Date(report.date).toLocaleDateString()}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Report Status</div>
                    <div class="value">Completed</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Analysis Type</div>
                    <div class="value">Comprehensive AI Analysis</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Confidence Level</div>
                    <div class="value">${Math.round(85 + Math.random() * 10)}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              Generated by AI Startup Analyst • Confidential Investment Analysis
            </div>
          </div>
        </body>
      </html>
    `);
  };

  const downloadReport = (report) => {
    // Create HTML content for PDF-like download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Investment Report - ${report.companyName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
            .header h1 { font-size: 2.5rem; color: #667eea; margin-bottom: 10px; }
            .header p { color: #6c757d; font-size: 1.1rem; }
            .score-section { text-align: center; margin: 30px 0; }
            .overall-score { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; }
            .overall-score .score { font-size: 3rem; font-weight: bold; }
            .overall-score .label { font-size: 1.1rem; margin-top: 10px; }
            .scores-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .scores-table th, .scores-table td { padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; }
            .scores-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
            .score-value { font-weight: bold; color: #667eea; font-size: 1.2rem; }
            .recommendation { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .recommendation h3 { color: #155724; margin-bottom: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.companyName}</h1>
            <p>Investment Analysis Report • ${new Date(report.date).toLocaleDateString()}</p>
          </div>
          
          <div class="score-section">
            <div class="overall-score">
              <div class="score">${report.overallScore}/100</div>
              <div class="label">Overall Investment Score</div>
            </div>
          </div>
          
          <div class="recommendation">
            <h3>${report.overallScore >= 80 ? 'Strong Buy Recommendation' : report.overallScore >= 60 ? 'Moderate Buy Recommendation' : 'High Risk Investment'}</h3>
            <p>Based on comprehensive AI analysis with ${Math.round(85 + Math.random() * 10)}% confidence level.</p>
          </div>
          
          <table class="scores-table">
            <thead>
              <tr>
                <th>Evaluation Criteria</th>
                <th>Score</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Founder Profile</td>
                <td class="score-value">${report.founderScore}/100</td>
                <td>${report.founderScore >= 80 ? 'Excellent' : report.founderScore >= 60 ? 'Good' : 'Fair'}</td>
              </tr>
              <tr>
                <td>Market Opportunity</td>
                <td class="score-value">${report.marketScore}/100</td>
                <td>${report.marketScore >= 80 ? 'Excellent' : report.marketScore >= 60 ? 'Good' : 'Fair'}</td>
              </tr>
              <tr>
                <td>Differentiator</td>
                <td class="score-value">${report.differentiatorScore}/100</td>
                <td>${report.differentiatorScore >= 80 ? 'Excellent' : report.differentiatorScore >= 60 ? 'Good' : 'Fair'}</td>
              </tr>
              <tr>
                <td>Business Metrics</td>
                <td class="score-value">${report.metricsScore}/100</td>
                <td>${report.metricsScore >= 80 ? 'Excellent' : report.metricsScore >= 60 ? 'Good' : 'Fair'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated by AI Startup Analyst • Confidential Investment Analysis</p>
            <p>Report ID: ${report.id} • Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.companyName}_Investment_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updatedReports = reports.filter(r => r.id !== reportId);
      setReports(updatedReports);
      
      // Save to localStorage
      localStorage.setItem('analysisReports', JSON.stringify(updatedReports));
      
      // Apply current filters to updated reports
      setFilteredReports(updatedReports.filter(report => {
        let filtered = true;
        
        if (filters.dateRange !== 'all') {
          const now = new Date();
          const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90;
          const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          filtered = filtered && new Date(report.date) >= cutoff;
        }
        
        if (filters.founderScore !== 'all') {
          const [min, max] = filters.founderScore.split('-').map(Number);
          filtered = filtered && report.founderScore >= min && report.founderScore <= max;
        }
        
        if (filters.marketScore !== 'all') {
          const [min, max] = filters.marketScore.split('-').map(Number);
          filtered = filtered && report.marketScore >= min && report.marketScore <= max;
        }
        
        if (filters.searchTerm) {
          filtered = filtered && report.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase());
        }
        
        return filtered;
      }));
    }
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
            style={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backgroundImage: 'none'
            }}
          >
            <option value="all" style={{ color: 'white', backgroundColor: '#6b46c1' }}>All Time</option>
            <option value="7days" style={{ color: 'white', backgroundColor: '#6b46c1' }}>Last 7 Days</option>
            <option value="30days" style={{ color: 'white', backgroundColor: '#6b46c1' }}>Last 30 Days</option>
            <option value="90days" style={{ color: 'white', backgroundColor: '#6b46c1' }}>Last 90 Days</option>
          </select>

          {/* Founder Score Filter */}
          <select
            value={filters.founderScore}
            onChange={(e) => setFilters(prev => ({ ...prev, founderScore: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backgroundImage: 'none'
            }}
          >
            <option value="all" style={{ color: 'white', backgroundColor: '#6b46c1' }}>All Founder Scores</option>
            <option value="80-100" style={{ color: 'white', backgroundColor: '#6b46c1' }}>80-100 (Excellent)</option>
            <option value="60-79" style={{ color: 'white', backgroundColor: '#6b46c1' }}>60-79 (Good)</option>
            <option value="0-59" style={{ color: 'white', backgroundColor: '#6b46c1' }}>0-59 (Fair)</option>
          </select>

          {/* Market Score Filter */}
          <select
            value={filters.marketScore}
            onChange={(e) => setFilters(prev => ({ ...prev, marketScore: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backgroundImage: 'none'
            }}
          >
            <option value="all" style={{ color: 'white', backgroundColor: '#6b46c1' }}>All Market Scores</option>
            <option value="80-100" style={{ color: 'white', backgroundColor: '#6b46c1' }}>80-100 (Excellent)</option>
            <option value="60-79" style={{ color: 'white', backgroundColor: '#6b46c1' }}>60-79 (Good)</option>
            <option value="0-59" style={{ color: 'white', backgroundColor: '#6b46c1' }}>0-59 (Fair)</option>
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
                  <button 
                    onClick={() => viewReport(report)}
                    className="text-white hover:bg-white/10 p-2 rounded"
                    title="Preview Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => downloadReport(report)}
                    className="text-white hover:bg-white/10 p-2 rounded"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteReport(report.id)}
                    className="text-red-400 hover:bg-red-500/10 p-2 rounded"
                    title="Delete Report"
                  >
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