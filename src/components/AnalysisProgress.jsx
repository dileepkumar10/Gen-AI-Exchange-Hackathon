import React, { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

const AnalysisProgress = ({ isAnalyzing, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [neurons, setNeurons] = useState([]);
  const [connections, setConnections] = useState([]);
  const hasStarted = useRef(false);

  const steps = [
    { name: "Document Extraction", duration: 2000 },
    { name: "Data Parsing", duration: 3000 },
    { name: "Investment Analysis", duration: 2500 },
    { name: "Report Generation", duration: 2000 }
  ];

  useEffect(() => {
    if (isAnalyzing) {
      // Generate neural network nodes
      const neuronNodes = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 20 + (i % 4) * 25,
        y: 20 + Math.floor(i / 4) * 25,
        active: false,
        pulse: Math.random() * 2000
      }));
      setNeurons(neuronNodes);
      
      // Generate connections
      const neuronConnections = [];
      for (let i = 0; i < neuronNodes.length - 1; i++) {
        for (let j = i + 1; j < neuronNodes.length; j++) {
          if (Math.random() > 0.7) {
            neuronConnections.push({ from: i, to: j, active: false });
          }
        }
      }
      setConnections(neuronConnections);
      
      // Animate neurons
      const interval = setInterval(() => {
        setNeurons(prev => prev.map(neuron => ({
          ...neuron,
          active: Math.random() > 0.6
        })));
        setConnections(prev => prev.map(conn => ({
          ...conn,
          active: Math.random() > 0.8
        })));
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (!isAnalyzing) {
      if (hasStarted.current) {
        hasStarted.current = false;
        setCurrentStep(0);
        setCompletedSteps([]);
        setNeurons([]);
        setConnections([]);
      }
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      let stepIndex = 0;
      
      const processStep = () => {
        if (stepIndex < steps.length) {
          setCurrentStep(stepIndex);
          setTimeout(() => {
            setCompletedSteps(prev => [...prev, stepIndex]);
            stepIndex++;
            if (stepIndex >= steps.length) {
              setTimeout(() => onComplete?.(), 800);
            } else {
              processStep();
            }
          }, steps[stepIndex].duration);
        }
      };
      processStep();
    }
  }, [isAnalyzing, onComplete, steps]);

  if (!isAnalyzing) return null;

  return (
    <div className="relative bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Connections */}
          {connections.map((conn, i) => {
            const fromNeuron = neurons[conn.from];
            const toNeuron = neurons[conn.to];
            if (!fromNeuron || !toNeuron) return null;
            return (
              <line
                key={i}
                x1={fromNeuron.x}
                y1={fromNeuron.y}
                x2={toNeuron.x}
                y2={toNeuron.y}
                stroke={conn.active ? '#06b6d4' : '#334155'}
                strokeWidth="0.2"
                className="transition-all duration-300"
              />
            );
          })}
          {/* Neurons */}
          {neurons.map((neuron) => (
            <circle
              key={neuron.id}
              cx={neuron.x}
              cy={neuron.y}
              r={neuron.active ? "1.5" : "1"}
              fill={neuron.active ? '#06b6d4' : '#475569'}
              className="transition-all duration-300"
            >
              {neuron.active && (
                <animate
                  attributeName="r"
                  values="1;2;1"
                  dur="1s"
                  repeatCount="1"
                />
              )}
            </circle>
          ))}
        </svg>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="text-center mb-10">
          {/* Agent Network Visualization */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-pulse" />
            <div className="absolute inset-1 rounded-full border border-purple-400/50" style={{
              animation: 'spin 3s linear infinite reverse'
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                <div className="absolute -inset-1 bg-cyan-400/20 rounded-full animate-ping" />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Analysis
            </span>
          </h3>
          <p className="text-cyan-200/80">Processing your startup deck...</p>
        </div>
        
        {/* Unique Step Visualization */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index && !isCompleted;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full border transition-all duration-500 ${
                    isCompleted ? 'border-emerald-400 bg-emerald-400/20' :
                    isCurrent ? 'border-cyan-400 bg-cyan-400/20' : 'border-slate-600 bg-slate-600/20'
                  }`}>
                    <div className="absolute inset-2 rounded-full flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-slate-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium transition-colors duration-500 ${
                    isCompleted ? 'text-emerald-300' :
                    isCurrent ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {step.name}
                  </div>
                  {isCurrent && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                      <span className="text-cyan-200/80 text-xs">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Unique Progress Visualization */}
        <div className="mt-10">
          <div className="relative h-6 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative"
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 animate-pulse" />
              <div className="absolute right-0 top-0 w-2 h-full bg-white/50 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-slate-400">Analysis Progress</span>
            <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {Math.round((completedSteps.length / steps.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;