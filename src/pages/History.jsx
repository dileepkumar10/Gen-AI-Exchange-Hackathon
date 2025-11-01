import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Eye, Download, Filter, Calendar, 
  CheckCircle, AlertCircle, XCircle, Play,
  FileText, BarChart3, TrendingUp
} from 'lucide-react';

const History = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock analysis history data
  const analysisHistory = [
    {
      id: 1,
      companyName: 'TechFlow AI',
      sector: 'AI/ML',
      status: 'completed',
      startTime: '2024-01-15T10:30:00',
      endTime: '2024-01-15T10:45:00',
      duration: 15,
      overallScore: 92,
      confidence: 0.94,
      filesProcessed: 3,
      analyst: 'John Smith'
    },
    {
      id: 2,
      companyName: 'GreenEnergy Solutions',
      sector: 'CleanTech',
      status: 'completed',
      startTime: '2024-01-14T14:20:00',
      endTime: '2024-01-14T14:38:00',
      duration: 18,
      overallScore: 78,
      confidence: 0.87,
      filesProcessed: 2,
      analyst: 'Sarah Johnson'
    },
    {
      id: 3,
      companyName: 'FinanceBot Pro',
      sector: 'FinTech',
      status: 'processing',
      startTime: '2024-01-15T16:15:00',
      endTime: null,
      duration: null,
      overallScore: null,
      confidence: null,
      filesProcessed: 4,
      analyst: 'Mike Chen'
    },
    {
      id: 4,
      companyName: 'HealthTracker',
      sector: 'HealthTech',
      status: 'failed',
      startTime: '2024-01-12T09:45:00',
      endTime: '2024-01-12T09:52:00',
      duration: 7,
      overallScore: null,
      confidence: null,
      filesProcessed: 1,
      analyst: 'Emily Davis',
      error: 'Document processing failed'
    },
    {
      id: 5,
      companyName: 'EduPlatform',
      sector: 'EdTech',
      status: 'completed',
      startTime: '2024-01-11T11:30:00',
      endTime: '2024-01-11T11:47:00',
      duration: 17,
      overallScore: 88,
      confidence: 0.91,
      filesProcessed: 5,
      analyst: 'David Wilson'
    },
    {
      id: 6,
      companyName: 'RetailTech Solutions',
      sector: 'E-commerce',
      status: 'completed',
      startTime: '2024-01-10T15:20:00',
      endTime: '2024-01-10T15:33:00',
      duration: 13,
      overallScore: 65,
      confidence: 0.78,
      filesProcessed: 2,
      analyst: 'Lisa Park'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Play className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredHistory = analysisHistory.filter(item => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesPeriod = selectedPeriod === 'all' || 
      (selectedPeriod === 'today' && new Date(item.startTime).toDateString() === new Date().toDateString()) ||
      (selectedPeriod === 'week' && new Date(item.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesStatus && matchesPeriod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analysis History</h1>
          <p className="text-slate-400 mt-1">Track all your startup analysis sessions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{analysisHistory.length}</div>
              <div className="text-slate-400 text-sm">Total Analyses</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {analysisHistory.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-slate-400 text-sm">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(analysisHistory.filter(a => a.duration).reduce((sum, a) => sum + a.duration, 0) / analysisHistory.filter(a => a.duration).length)}m
              </div>
              <div className="text-slate-400 text-sm">Avg Duration</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(analysisHistory.filter(a => a.overallScore).reduce((sum, a) => sum + a.overallScore, 0) / analysisHistory.filter(a => a.overallScore).length)}
              </div>
              <div className="text-slate-400 text-sm">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-xl font-semibold text-white">Recent Analysis Sessions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Company</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Status</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Started</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Duration</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Score</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Confidence</th>
                <th className="text-left text-slate-400 font-medium py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, idx) => {
                const startDateTime = formatDateTime(item.startTime);
                
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">{item.companyName}</div>
                        <div className="text-slate-400 text-sm">{item.sector}</div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      {item.error && (
                        <div className="text-red-400 text-xs mt-1">{item.error}</div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-white text-sm">{startDateTime.date}</div>
                      <div className="text-slate-400 text-xs">{startDateTime.time}</div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-white">
                        {item.duration ? `${item.duration}m` : '-'}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      {item.overallScore ? (
                        <div className={`text-lg font-bold ${
                          item.overallScore >= 80 ? 'text-green-400' :
                          item.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {item.overallScore}
                        </div>
                      ) : (
                        <div className="text-slate-400">-</div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      {item.confidence ? (
                        <div className="text-white">
                          {Math.round(item.confidence * 100)}%
                        </div>
                      ) : (
                        <div className="text-slate-400">-</div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        {item.status === 'completed' && (
                          <>
                            <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.status === 'processing' && (
                          <button className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors">
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'failed' && (
                          <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6">Analysis Timeline</h3>
        <div className="space-y-4">
          {filteredHistory.slice(0, 5).map((item, idx) => {
            const startDateTime = formatDateTime(item.startTime);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.companyName}</h4>
                      <p className="text-slate-400 text-sm">
                        {startDateTime.date} at {startDateTime.time} • {item.analyst}
                      </p>
                    </div>
                    
                    {item.overallScore && (
                      <div className={`text-xl font-bold ${
                        item.overallScore >= 80 ? 'text-green-400' :
                        item.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {item.overallScore}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default History;