import { useState, useEffect, useRef } from 'react';

const useAnalysisProgress = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepName, setStepName] = useState('');
  const [stepMessage, setStepMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const steps = [
    { name: "Document Processing", icon: "📄", description: "Extracting and processing documents..." },
    { name: "Market Intelligence", icon: "🌐", description: "Gathering market data and intelligence..." },
    { name: "AI Analysis", icon: "📊", description: "Running multi-model AI analysis..." },
    { name: "Predictive Analytics", icon: "🔮", description: "Calculating success probabilities..." },
    { name: "Report Generation", icon: "📝", description: "Generating investment memo..." }
  ];

  const connect = () => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = `ws://127.0.0.1:8000/ws/${userId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Send ping to maintain connection
        const pingInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish real-time connection');
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'connection_established':
        console.log('Real-time connection established');
        break;

      case 'analysis_started':
        setIsAnalyzing(true);
        setCurrentStep(0);
        setProgress(0);
        setAnalysisResults(null);
        setError(null);
        console.log('Analysis started:', data.session_id);
        break;

      case 'analysis_progress':
        setCurrentStep(data.step - 1); // Convert to 0-based index
        setStepName(data.step_name);
        setStepMessage(data.message);
        setProgress(data.progress_percentage);
        if (data.confidence !== undefined) {
          setConfidence(data.confidence);
        }
        console.log(`Progress: Step ${data.step} - ${data.step_name}`);
        break;

      case 'analysis_completed':
        setIsAnalyzing(false);
        setCurrentStep(steps.length);
        setProgress(100);
        setAnalysisResults(data.results);
        console.log('Analysis completed:', data.duration, 'seconds');
        break;

      case 'analysis_error':
        setIsAnalyzing(false);
        setError(data.message);
        console.error('Analysis error:', data.message);
        break;

      case 'pong':
        // Handle ping response
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  const resetProgress = () => {
    setCurrentStep(0);
    setStepName('');
    setStepMessage('');
    setProgress(0);
    setConfidence(null);
    setIsAnalyzing(false);
    setAnalysisResults(null);
    setError(null);
  };

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId]);

  return {
    // Connection state
    isConnected,
    
    // Progress state
    currentStep,
    stepName,
    stepMessage,
    progress,
    confidence,
    isAnalyzing,
    steps,
    
    // Results and errors
    analysisResults,
    error,
    
    // Control functions
    connect,
    disconnect,
    resetProgress
  };
};

export default useAnalysisProgress;