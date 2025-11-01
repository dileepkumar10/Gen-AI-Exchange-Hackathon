import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await apiService.healthCheck();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={checkConnection}
        disabled={isChecking}
        className="flex items-center space-x-2 text-sm text-white/80 hover:text-white transition-colors"
      >
        {isChecking ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : isConnected ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnected ? 'Backend Online' : 'Backend Offline'}
        </span>
      </button>
    </div>
  );
};

export default ConnectionStatus;