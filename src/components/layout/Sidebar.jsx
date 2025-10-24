import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, FileText, Settings, 
  BarChart3, MessageSquare, History, TrendingUp,
  Brain, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
    { path: '/upload', icon: Upload, label: 'Upload & Analyze', color: 'text-green-400' },
    { path: '/reports', icon: FileText, label: 'Reports', color: 'text-purple-400' },
    { path: '/history', icon: History, label: 'Analysis History', color: 'text-orange-400' },
    { path: '/chat', icon: MessageSquare, label: 'AI Assistant', color: 'text-pink-400' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-cyan-400' },
    { path: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-400' }
  ];

  return (
    <motion.div 
      className={`bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">AI Analyst</h1>
              <p className="text-slate-400 text-xs">Venture Capital</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-slate-800/80 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-400 group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <motion.div
                  className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Stats Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">AI Status</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Analyses Today</span>
                <span className="text-green-400">156</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Success Rate</span>
                <span className="text-blue-400">94%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;