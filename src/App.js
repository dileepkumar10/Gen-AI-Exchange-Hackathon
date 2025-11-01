import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StartupAIAnalyst from './components/StartupAIAnalyst';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<StartupAIAnalyst activeTab="upload" />} />
            <Route path="/upload" element={<StartupAIAnalyst activeTab="upload" />} />
            <Route path="/comprehensive" element={<StartupAIAnalyst activeTab="comprehensive" />} />
            <Route path="/analysis" element={<StartupAIAnalyst activeTab="analysis" />} />
            <Route path="/memo" element={<StartupAIAnalyst activeTab="memo" />} />
            <Route path="/reports" element={<StartupAIAnalyst activeTab="reports" />} />
            <Route path="/analytics" element={<StartupAIAnalyst activeTab="analytics" />} />
            <Route path="/integration" element={<StartupAIAnalyst activeTab="integration" />} />
            <Route path="/settings" element={<StartupAIAnalyst activeTab="settings" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;