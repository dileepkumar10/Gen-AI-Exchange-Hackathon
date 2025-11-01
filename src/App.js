import React from 'react';
import { Toaster } from 'react-hot-toast';
import StartupAIAnalyst from './components/StartupAIAnalyst';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  // Force new UI - prevent any redirects
  React.useEffect(() => {
    // Clear any stored redirects
    localStorage.removeItem('redirect_url');
    localStorage.removeItem('last_route');
    
    // Ensure we stay on the root path
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh' }}>
        <StartupAIAnalyst />
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;