import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, Database, Zap, 
  Save, RefreshCw, Download, Upload,
  Moon, Sun, Globe, Lock
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Investment Analyst',
      email: 'analyst@venture.com',
      company: 'Venture Capital Firm',
      role: 'Senior Analyst'
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC-8',
      notifications: true,
      emailAlerts: true,
      weeklyReports: true
    },
    analysis: {
      confidenceThreshold: 0.8,
      autoAnalysis: true,
      saveReports: true,
      founderWeight: 25,
      marketWeight: 30,
      productWeight: 25,
      tractionWeight: 20
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      dataRetention: 90,
      exportEnabled: true
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'analysis', label: 'Analysis', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database }
  ];

  const handleSave = () => {
    // Simulate save
    alert('Settings saved successfully!');
  };

  const SettingCard = ({ title, description, children }) => (
    <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <SettingCard title="Personal Information" description="Update your profile details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, name: e.target.value }
              }))}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, email: e.target.value }
              }))}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <input
              type="text"
              value={settings.profile.company}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, company: e.target.value }
              }))}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <select
              value={settings.profile.role}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, role: e.target.value }
              }))}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="Senior Analyst">Senior Analyst</option>
              <option value="Investment Manager">Investment Manager</option>
              <option value="Partner">Partner</option>
              <option value="Associate">Associate</option>
            </select>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <SettingCard title="Display Preferences" description="Customize your interface">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Theme</label>
              <p className="text-slate-400 text-sm">Choose your preferred theme</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: 'light' }
                }))}
                className={`p-2 rounded-lg ${settings.preferences.theme === 'light' ? 'bg-blue-500' : 'bg-slate-600'}`}
              >
                <Sun className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: 'dark' }
                }))}
                className={`p-2 rounded-lg ${settings.preferences.theme === 'dark' ? 'bg-blue-500' : 'bg-slate-600'}`}
              >
                <Moon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Email Notifications</label>
              <p className="text-slate-400 text-sm">Receive analysis completion emails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.emailAlerts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, emailAlerts: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderAnalysisSettings = () => (
    <div className="space-y-6">
      <SettingCard title="Analysis Configuration" description="Customize AI analysis parameters">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confidence Threshold: {Math.round(settings.analysis.confidenceThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={settings.analysis.confidenceThreshold}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                analysis: { ...prev.analysis, confidenceThreshold: parseFloat(e.target.value) }
              }))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <p className="text-slate-400 text-sm mt-1">Minimum confidence level for analysis results</p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Scoring Weights</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Founder: {settings.analysis.founderWeight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={settings.analysis.founderWeight}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    analysis: { ...prev.analysis, founderWeight: parseInt(e.target.value) }
                  }))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Market: {settings.analysis.marketWeight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={settings.analysis.marketWeight}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    analysis: { ...prev.analysis, marketWeight: parseInt(e.target.value) }
                  }))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Product: {settings.analysis.productWeight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={settings.analysis.productWeight}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    analysis: { ...prev.analysis, productWeight: parseInt(e.target.value) }
                  }))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Traction: {settings.analysis.tractionWeight}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={settings.analysis.tractionWeight}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    analysis: { ...prev.analysis, tractionWeight: parseInt(e.target.value) }
                  }))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Total: {settings.analysis.founderWeight + settings.analysis.marketWeight + 
                     settings.analysis.productWeight + settings.analysis.tractionWeight}%
            </p>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <SettingCard title="Security Settings" description="Manage your account security">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Two-Factor Authentication</label>
              <p className="text-slate-400 text-sm">Add an extra layer of security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactor: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
              }))}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <SettingCard title="Data Management" description="Control your data and exports">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Data Retention</label>
              <p className="text-slate-400 text-sm">How long to keep analysis data</p>
            </div>
            <select
              value={settings.security.dataRetention}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, dataRetention: parseInt(e.target.value) }
              }))}
              className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>
        
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50"
          >
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'preferences' && renderPreferencesSettings()}
            {activeTab === 'analysis' && renderAnalysisSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'data' && renderDataSettings()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;