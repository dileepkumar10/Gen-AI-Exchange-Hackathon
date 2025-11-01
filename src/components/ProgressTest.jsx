import React from 'react';
import { motion } from 'framer-motion';
import useAnalysisProgress from '../hooks/useAnalysisProgress';

const ProgressTest = ({ userId = 'test-user' }) => {
  const {
    isConnected,
    currentStep,
    stepName,
    stepMessage,
    progress,
    confidence,
    isAnalyzing,
    steps,
    analysisResults,
    error,
    resetProgress
  } = useAnalysisProgress(userId);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">WebSocket Progress Test</h1>
      
      {/* Connection Status */}
      <div className="mb-4 p-4 rounded-lg bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className={`inline-block px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {error && (
          <div className="mt-2 text-red-400 text-sm">Error: {error}</div>
        )}
      </div>

      {/* Analysis Status */}
      <div className="mb-4 p-4 rounded-lg bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Analysis Status</h2>
        <div className={`inline-block px-3 py-1 rounded-full text-sm ${
          isAnalyzing ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {isAnalyzing ? '⚡ Analyzing...' : '⏸️ Idle'}
        </div>
      </div>

      {/* Progress Details */}
      {isAnalyzing && (
        <div className="mb-4 p-4 rounded-lg bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">Progress Details</h2>
          <div className="space-y-2">
            <div>Current Step: {currentStep + 1} / {steps.length}</div>
            <div>Step Name: {stepName || 'N/A'}</div>
            <div>Message: {stepMessage || 'N/A'}</div>
            <div>Progress: {Math.round(progress || 0)}%</div>
            {confidence && <div>Confidence: {Math.round(confidence * 100)}%</div>}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Steps Visualization */}
      <div className="mb-4 p-4 rounded-lg bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Steps</h2>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-2 rounded ${
                index === currentStep ? 'bg-blue-500/20' :
                index < currentStep ? 'bg-green-500/20' : 'bg-gray-700'
              }`}
            >
              <span className="text-2xl">{step.icon}</span>
              <div>
                <div className="font-medium">{step.name}</div>
                <div className="text-sm text-gray-400">{step.description}</div>
              </div>
              <div className="ml-auto">
                {index < currentStep && <span className="text-green-400">✓</span>}
                {index === currentStep && isAnalyzing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {analysisResults && (
        <div className="mb-4 p-4 rounded-lg bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <pre className="text-sm bg-gray-900 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(analysisResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 rounded-lg bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Controls</h2>
        <button
          onClick={resetProgress}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
};

export default ProgressTest;