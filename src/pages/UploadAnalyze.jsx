import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Mic, Play, Pause, X, 
  CheckCircle, AlertCircle, Clock, Zap,
  Brain, BarChart3, TrendingUp, Target
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const UploadAnalyze = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveform, setWaveform] = useState([]);
  
  const recordingInterval = useRef(null);

  const analysisSteps = [
    { 
      name: "Document Processing", 
      icon: FileText, 
      description: "Extracting text and analyzing structure",
      duration: 2000
    },
    { 
      name: "Market Intelligence", 
      icon: BarChart3, 
      description: "Gathering competitive and market data",
      duration: 3000
    },
    { 
      name: "AI Analysis", 
      icon: Brain, 
      description: "Multi-model consensus scoring",
      duration: 4000
    },
    { 
      name: "Report Generation", 
      icon: TrendingUp, 
      description: "Creating investment memo",
      duration: 2000
    }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded',
      uploadDate: new Date().toISOString()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
      setWaveform(prev => [...prev.slice(-20), Math.random() * 100]);
    }, 100);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordingInterval.current);
    
    const voiceFile = {
      id: Date.now(),
      name: `Voice Recording ${Math.floor(recordingTime / 10)}s.mp3`,
      type: 'audio/mp3',
      size: recordingTime * 1024,
      status: 'uploaded',
      isVoice: true,
      uploadDate: new Date().toISOString()
    };
    
    setUploadedFiles(prev => [...prev, voiceFile]);
    setRecordingTime(0);
    setWaveform([]);
  };

  const runAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulate analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(i);
      await new Promise(resolve => setTimeout(resolve, analysisSteps[i].duration));
    }

    // Enhanced mock results with full details
    const mockResults = {
      companyName: "TechFlow AI",
      overallScore: 87,
      scores: {
        founder: 92,
        market: 85,
        product: 88,
        traction: 84
      },
      confidence: 0.94,
      riskLevel: "Medium",
      recommendation: "Strong Investment Opportunity",
      companyInfo: {
        companyName: "TechFlow AI",
        founders: ["Sarah Chen (CTO)", "Mike Rodriguez (CEO)"],
        sector: "AI/ML",
        stage: "Series A",
        foundedYear: "2022",
        location: "San Francisco, CA"
      },
      investmentMemo: {
        founderProfile: {
          score: 92,
          summary: "Exceptional founding team with Sarah Chen (ex-Google AI, 8 years ML experience) and Mike Rodriguez (Stanford MBA, previous startup exit at $50M). Strong technical and business complementarity with proven track record in AI/ML space.",
          keyPoints: [
            "Sarah: Senior ML Engineer at Google for 5 years, PhD in Computer Science",
            "Mike: Successfully exited previous AI startup to Microsoft for $50M",
            "Deep domain expertise in natural language processing and computer vision",
            "Strong network in Silicon Valley AI ecosystem"
          ]
        },
        problemMarket: {
          score: 85,
          summary: "Addressing the $127B AI automation market with 23% CAGR. Clear problem validation through 100+ customer interviews and strong early traction with enterprise clients.",
          keyPoints: [
            "TAM: $127B AI automation market growing at 23% CAGR",
            "Direct competitors include UiPath, Automation Anywhere",
            "Differentiated by focus on no-code AI workflow automation",
            "Strong validation with 15 enterprise pilot customers"
          ]
        },
        uniqueDifferentiator: {
          score: 88,
          summary: "Revolutionary no-code AI platform that enables non-technical users to build complex AI workflows. Patent-pending visual programming interface with 10x faster deployment than competitors.",
          keyPoints: [
            "3 patents filed for visual AI workflow technology",
            "10x faster deployment compared to traditional solutions",
            "No-code interface accessible to business users",
            "Proprietary AI model optimization engine"
          ]
        },
        businessMetrics: {
          score: 84,
          summary: "$2.1M ARR with 180% YoY growth. Strong unit economics with $85K ACV and 95% gross margins. Seeking $15M Series A for market expansion.",
          keyPoints: [
            "Current ARR: $2.1M with 180% YoY growth",
            "Average Contract Value: $85K annually",
            "Gross margins: 95%, Net revenue retention: 125%",
            "25 enterprise customers, 150+ in pipeline"
          ]
        }
      },
      riskFactors: [
        "Intense competition from well-funded incumbents like UiPath",
        "Regulatory uncertainty around AI automation in certain industries",
        "Dependency on key technical talent in competitive market",
        "Customer concentration risk with top 5 clients representing 60% of revenue"
      ],
      nextSteps: [
        "Conduct technical due diligence on proprietary AI algorithms",
        "Interview key customers to validate product-market fit",
        "Review detailed financial projections and unit economics",
        "Assess competitive positioning and defensibility"
      ],
      prediction: {
        success_probability: 0.78,
        success_percentage: "78%",
        key_strengths: ["Strong Founder Profile", "Large Market Opportunity", "Unique Technology"],
        key_risks: ["High Competition", "Customer Concentration"],
        comparable_success_rate: "Top 25% of AI startups",
        investment_recommendation: "Strong Investment Opportunity"
      }
    };

    setAnalysisResults(mockResults);
    setIsAnalyzing(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Upload & Analyze</h1>
        <p className="text-slate-400 mt-1">Upload startup materials for AI-powered analysis</p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Document Upload
          </h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragActive 
                ? 'border-blue-400 bg-blue-500/10 scale-105' 
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-400 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-white font-medium mb-2">Drag & drop files here</p>
                <p className="text-slate-400 text-sm">or click to browse</p>
                <p className="text-slate-500 text-xs mt-2">PDF, PPT, DOC, DOCX (max 10MB)</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Voice Recording */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Mic className="w-5 h-5 mr-2" />
            Voice Pitch Recording
          </h3>
          
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105'
            }`}>
              {isRecording ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Waveform Visualization */}
            {isRecording && waveform.length > 0 && (
              <div className="flex items-center justify-center space-x-1 mb-4 h-12">
                {waveform.map((height, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-red-400 w-1 rounded-full"
                    style={{ height: `${Math.max(4, height / 3)}px` }}
                    animate={{ height: `${Math.max(4, height / 3)}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            )}

            {isRecording ? (
              <div>
                <p className="text-red-400 font-medium mb-2">Recording... {formatTime(Math.floor(recordingTime / 10))}</p>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Stop Recording
                </button>
              </div>
            ) : (
              <div>
                <p className="text-white mb-2">Record your pitch presentation</p>
                <button
                  onClick={startRecording}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all"
                >
                  Start Recording
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            
            <div className="space-y-3">
              {uploadedFiles.map((file, idx) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {file.isVoice ? (
                        <Mic className="w-5 h-5 text-white" />
                      ) : (
                        <FileText className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{file.name}</h4>
                      <p className="text-slate-400 text-sm">
                        {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Ready</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Section */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
          {uploadedFiles.length > 0 && (
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Analysis Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-700/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">AI Analysis Progress</h4>
                <div className="text-blue-400 text-sm">
                  Step {analysisStep + 1} of {analysisSteps.length}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-600 rounded-full h-2 mb-6">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
                />
              </div>
              
              {/* Steps in One Row */}
              <div className="grid grid-cols-4 gap-4">
                {analysisSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`text-center p-4 rounded-lg transition-all ${
                      idx === analysisStep
                        ? 'bg-blue-500/20 border-2 border-blue-400 scale-105'
                        : idx < analysisStep
                        ? 'bg-green-500/20 border-2 border-green-400'
                        : 'bg-slate-600/30 border-2 border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      idx === analysisStep
                        ? 'bg-blue-500 animate-pulse'
                        : idx < analysisStep
                        ? 'bg-green-500'
                        : 'bg-slate-600'
                    }`}>
                      {idx < analysisStep ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : idx === analysisStep ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <step.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <h5 className="text-white font-medium text-sm mb-1">{step.name}</h5>
                    <p className="text-slate-400 text-xs">{step.description}</p>
                    
                    {idx === analysisStep && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-blue-400 text-xs font-medium"
                      >
                        Processing...
                      </motion.div>
                    )}
                    {idx < analysisStep && (
                      <div className="mt-2 text-green-400 text-xs font-medium">✓ Complete</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-6"
            >
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-white mb-2">{analysisResults.companyName}</h4>
                  <div className="text-6xl font-bold text-green-400 mb-2">{analysisResults.overallScore}</div>
                  <p className="text-slate-300 mb-4">{analysisResults.recommendation}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">Confidence: {Math.round(analysisResults.confidence * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-300">Risk: {analysisResults.riskLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysisResults.scores).map(([key, score]) => (
                  <div key={key} className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{score}</div>
                    <div className="text-slate-300 text-sm capitalize">{key}</div>
                  </div>
                ))}
              </div>
              
              {/* Detailed Analysis Sections */}
              <div className="mt-8 space-y-6">
                {analysisResults.investmentMemo && Object.entries(analysisResults.investmentMemo).map(([section, data]) => (
                  <div key={section} className="bg-slate-700/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-white capitalize">
                        {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Score: {data.score}
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4 leading-relaxed">{data.summary}</p>
                    {data.keyPoints && (
                      <div className="space-y-2">
                        <h5 className="text-white font-medium">Key Points:</h5>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {data.keyPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Risk Factors & Next Steps */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/20">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                      Risk Factors
                    </h4>
                    <ul className="space-y-2">
                      {analysisResults.riskFactors?.map((risk, idx) => (
                        <li key={idx} className="text-red-200 flex items-start">
                          <span className="text-red-400 mr-2">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                      Recommended Next Steps
                    </h4>
                    <ul className="space-y-2">
                      {analysisResults.nextSteps?.map((step, idx) => (
                        <li key={idx} className="text-green-200 flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isAnalyzing && !analysisResults && uploadedFiles.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-slate-400 mb-2">Ready for Analysis</h4>
            <p className="text-slate-500">Upload startup materials to begin AI-powered analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadAnalyze;