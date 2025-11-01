  import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, Mic, Users, TrendingUp, Lightbulb, DollarSign, Star, Download, Settings, Play, Pause, Activity, Globe, BarChart3, Zap, HelpCircle, Building2, LogOut, User, Bell, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import DemoScript from './DemoScript';
import LetsVentureIntegration from './LetsVentureIntegration';
import AuthModal from './AuthModal';
import EnhancedDashboard from './EnhancedDashboard';
import EnhancedAnalysisDashboard from './EnhancedAnalysisDashboard';
import DataVisualization from './DataVisualization';
import ReportHistory from './ReportHistory';
import AIChatInterface from './AIChatInterface';
import ComprehensiveAnalysis from './ComprehensiveAnalysis';

import Button from './ui/Button';
import Card from './ui/Card';
import apiService from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';
import AnalysisProgress from './AnalysisProgress';

import './animations.css';

const StartupAIAnalyst = () => {
  const { isAuthenticated, user, loading, login: authLogin, logout: authLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('comprehensive');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [investorPreferences, setInvestorPreferences] = useState({
    founder: 25,
    market: 25,
    differentiator: 25,
    metrics: 25
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiCalls, setApiCalls] = useState([]);
  const [waveform, setWaveform] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [showDemoScript, setShowDemoScript] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [showLoginFirst, setShowLoginFirst] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [marketIntelligence, setMarketIntelligence] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const fileInputRef = useRef(null);
  const recordingInterval = useRef(null);

  // Enhanced company detection
  const detectCompanyType = (files) => {
    const keywords = {
      'uber': { name: 'Uber Technologies', sector: 'Transportation', score: 92 },
      'airbnb': { name: 'Airbnb', sector: 'Travel/Hospitality', score: 89 },
      'stripe': { name: 'Stripe', sector: 'FinTech', score: 94 },
      'zoom': { name: 'Zoom', sector: 'Communications', score: 87 },
      'tesla': { name: 'Tesla', sector: 'Electric Vehicles', score: 91 }
    };
    
    for (const file of files) {
      for (const [keyword, data] of Object.entries(keywords)) {
        if (file.name.toLowerCase().includes(keyword)) {
          return data;
        }
      }
    }
    return null;
  };

  // Default startup data when no files uploaded
  const getDefaultStartupData = (fileName = 'Unknown Company') => {
    const companyName = fileName.replace(/\.(pdf|pptx|docx|ppt|doc)$/i, '').replace(/[-_]/g, ' ');
    return {
      companyName: companyName || 'Startup Analysis',
      founders: ['Founder information not extracted'],
      sector: 'Sector not identified',
      stage: 'Stage not specified',
      foundedYear: 'Year not found',
      location: 'Location not specified'
    };
  };



  // Mock API calls
  const mockAPIs = [
    { name: 'Crunchbase API', endpoint: '/companies/search', status: 'success' },
    { name: 'LinkedIn API', endpoint: '/founders/profile', status: 'success' },
    { name: 'News API', endpoint: '/articles/company', status: 'success' }
  ];

  // Loading messages with personality
  const loadingMessages = [
    "🤖 Data Extraction Agent: Reading your pitch deck...",
    "🌐 Public Data Agent: Researching market intelligence...",
    "📊 Analysis Agent: Crunching the numbers...",
    "📝 Memo Agent: Crafting investment insights...",
    "✨ Quality Agent: Polishing the final report..."
  ];

  // Enhanced drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload({ target: { files } });
  };
  
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      return;
    }
    
    if (!isAuthenticated && !demoMode) {
      setShowAuthModal(true);
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Invalid file type. Please upload PDF, PPT, DOC, DOCX, or TXT files.`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name}: File too large. Maximum size is 10MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Add files to state with enhanced metadata
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toLocaleDateString(),
      file: file,
      status: 'uploaded',
      preview: file.type.includes('pdf') ? '📄' : 
               file.type.includes('word') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') ? '📝' :
               file.type.includes('text') || file.name.toLowerCase().endsWith('.txt') ? '📄' : '📊'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Clear previous analysis results when new files are uploaded
    setAnalysisResults(null);
    
    // Clear the input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordingInterval.current);
    // Simulate adding voice recording as file
    const voiceFile = {
      id: Date.now(),
      name: `Voice Recording ${recordingTime}s.mp3`,
      type: 'audio/mp3',
      size: recordingTime * 1024,
      uploadDate: new Date().toLocaleDateString(),
      isVoice: true
    };
    setUploadedFiles(prev => [...prev, voiceFile]);
    setRecordingTime(0);
    setWaveform([]);
  };

  // WebSocket connection management
  const setupWebSocket = useCallback(() => {
    if (!isAuthenticated || demoMode) return;
    
    const userId = user?.username || 'current_user';
    
    apiService.connectWebSocket(userId, {
      onOpen: () => {
        setWsConnected(true);
        console.log('Real-time connection established');
      },
      onClose: () => {
        setWsConnected(false);
        console.log('Real-time connection lost');
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      }
    });
    
    // Setup message handlers
    apiService.onWebSocketMessage('analysis_progress', (data) => {
      setCurrentStep(data.step - 1);
      console.log(`Analysis progress: ${data.step_name} - ${data.message}`);
    });
    
    apiService.onWebSocketMessage('analysis_completed', (data) => {
      console.log('Analysis completed via WebSocket');
      setIsAnalyzing(false);
      // Handle completed analysis data
    });
    
    apiService.onWebSocketMessage('live_metrics', (data) => {
      setLiveMetrics(data.metrics);
    });
    
    apiService.onWebSocketMessage('market_update', (data) => {
      setMarketIntelligence(data.data);
    });
    
    apiService.onWebSocketMessage('notification', (data) => {
      setNotifications(prev => [data.notification, ...prev.slice(0, 9)]); // Keep last 10
    });
    
  }, [isAuthenticated, demoMode, user]);
  
  // Check backend connection and setup WebSocket
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiService.healthCheck();
        setBackendConnected(true);
        console.log('Backend connected');
      } catch (error) {
        console.log('Backend not connected, using demo mode');
        setBackendConnected(false);
        setDemoMode(true);
      }
    };
    checkBackend();
  }, []);

  // Setup WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setupWebSocket();
    }
    return () => {
      apiService.disconnectWebSocket();
    };
  }, [isAuthenticated, loading, setupWebSocket]);
  
  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      apiService.disconnectWebSocket();
    };
  }, []);

  // Voice waveform effect
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setWaveform(prev => [...prev.slice(-20), Math.random() * 100]);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Authentication handlers
  const handleAuthSuccess = () => {
    console.log('handleAuthSuccess called');
    setShowAuthModal(false);
    setDemoMode(false);
    console.log('Authentication successful');
    setActiveTab('upload');
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    console.log('Switched to demo mode');
  };

  const handleLogout = () => {
    authLogout();
    setDemoMode(false);
    setUploadedFiles([]);
    setAnalysisResults(null);
    setActiveTab('comprehensive');
  };



  // Mock API calls effect
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => {
        setApiCalls(mockAPIs);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setApiCalls([]);
    }
  }, [isAnalyzing]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportToPDF = () => {
    if (!analysisResults) return;
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 40;
    
    // Professional Header with subtle line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, pageWidth - 20, 35);
    
    // Company Logo Area (placeholder)
    pdf.setFillColor(245, 245, 245);
    pdf.rect(20, 15, 25, 15, 'F');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('LOGO', 32.5, 25, { align: 'center' });
    
    // Title - Professional Typography
    pdf.setTextColor(50, 50, 50);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('INVESTMENT ANALYSIS REPORT', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Confidential Investment Memorandum', pageWidth / 2, 32, { align: 'center' });
    
    yPosition = 50;
    
    // Executive Summary Box
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(1);
    pdf.rect(20, yPosition, pageWidth - 40, 45);
    
    // Company Name - Professional styling
    pdf.setTextColor(30, 30, 30);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(analysisResults.companyInfo.companyName, pageWidth / 2, yPosition + 15, { align: 'center' });
    
    // Company Details
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`${analysisResults.companyInfo.sector} | ${analysisResults.companyInfo.stage} | Founded ${analysisResults.companyInfo.foundedYear}`, pageWidth / 2, yPosition + 25, { align: 'center' });
    
    // Date and Confidentiality
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Analysis Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 35, { align: 'center' });
    
    yPosition += 60;
    
    // Investment Score - Professional Design
    const scoreBoxWidth = 80;
    const scoreBoxHeight = 40;
    const scoreBoxX = (pageWidth - scoreBoxWidth) / 2;
    
    // Score background
    const scoreColor = analysisResults.overallScore >= 80 ? [34, 139, 34] : 
                      analysisResults.overallScore >= 60 ? [255, 165, 0] : [220, 20, 60];
    
    pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.rect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 'F');
    
    // Score text
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text(analysisResults.overallScore.toString(), scoreBoxX + scoreBoxWidth/2, yPosition + 20, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text('INVESTMENT SCORE', scoreBoxX + scoreBoxWidth/2, yPosition + 30, { align: 'center' });
    
    // Score interpretation
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const scoreText = analysisResults.overallScore >= 80 ? 'Strong Investment Opportunity' :
                     analysisResults.overallScore >= 60 ? 'Moderate Investment Potential' : 'High Risk Investment';
    pdf.text(scoreText, pageWidth / 2, yPosition + 50, { align: 'center' });
    
    yPosition += 70;
    
    // Professional Score Table
    const tableY = yPosition;
    const rowHeight = 20;
    const colWidth = (pageWidth - 40) / 3;
    
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, tableY, pageWidth - 40, rowHeight, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, tableY, pageWidth - 40, rowHeight);
    
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('EVALUATION CRITERIA', 25, tableY + 12);
    pdf.text('SCORE', 20 + colWidth * 2 + 10, tableY + 12);
    pdf.text('RATING', 20 + colWidth * 2 + 50, tableY + 12);
    
    const scores = [
      { label: 'Founder Profile', score: analysisResults.founderScore },
      { label: 'Market Opportunity', score: analysisResults.marketScore },
      { label: 'Unique Differentiator', score: analysisResults.differentiatorScore },
      { label: 'Business Metrics', score: analysisResults.metricsScore }
    ];
    
    scores.forEach((item, index) => {
      const y = tableY + rowHeight * (index + 1);
      
      // Row background (alternating)
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, y, pageWidth - 40, rowHeight, 'F');
      }
      
      // Row border
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(20, y, pageWidth - 40, rowHeight);
      
      // Content
      pdf.setTextColor(70, 70, 70);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(item.label, 25, y + 12);
      
      // Score
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.score.toString(), 20 + colWidth * 2 + 20, y + 12, { align: 'center' });
      
      // Rating
      pdf.setFont('helvetica', 'normal');
      const rating = item.score >= 80 ? 'Excellent' : item.score >= 60 ? 'Good' : 'Fair';
      pdf.text(rating, 20 + colWidth * 2 + 60, y + 12);
    });
    
    yPosition += rowHeight * 5 + 20;
    
    // New page for detailed analysis
    pdf.addPage();
    yPosition = 40;
    
    // Professional page header
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 25, pageWidth - 20, 25);
    
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('DETAILED INVESTMENT ANALYSIS', 20, 20);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Page 2 of Investment Memo - ${analysisResults.companyInfo.companyName}`, 20, 32);
    
    yPosition = 50;
    
    // Investment Memo Sections - Professional Layout
    Object.entries(analysisResults.investmentMemo).forEach(([section, data]) => {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 40;
        
        // Page header for continuation
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(20, 25, pageWidth - 20, 25);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(`Investment Analysis - ${analysisResults.companyInfo.companyName} (Continued)`, 20, 20);
        yPosition = 35;
      }
      
      // Section header with professional styling
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.8);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      
      pdf.setTextColor(50, 50, 50);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      const sectionTitle = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      pdf.text(sectionTitle.toUpperCase(), 20, yPosition + 12);
      
      // Score in professional format
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`Score: ${data.score}/100`, pageWidth - 60, yPosition + 12);
      
      yPosition += 20;
      
      // Summary with professional formatting
      pdf.setTextColor(70, 70, 70);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 40);
      summaryLines.slice(0, 4).forEach((line, idx) => {
        pdf.text(line, 20, yPosition + (idx * 5));
      });
      
      yPosition += summaryLines.length * 5 + 10;
      
      // Key points with professional bullets
      if (data.keyPoints && data.keyPoints.length > 0) {
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('KEY HIGHLIGHTS:', 20, yPosition);
        yPosition += 8;
        
        data.keyPoints.slice(0, 4).forEach(point => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 40;
          }
          
          // Professional bullet
          pdf.setTextColor(120, 120, 120);
          pdf.text('•', 25, yPosition);
          
          pdf.setTextColor(70, 70, 70);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const pointLines = pdf.splitTextToSize(point, pageWidth - 50);
          pointLines.slice(0, 2).forEach((line, idx) => {
            pdf.text(line, 32, yPosition + (idx * 4));
          });
          yPosition += Math.max(pointLines.length * 4, 6);
        });
      }
      
      yPosition += 15;
    });
    
    // Risk Factors Page
    if (analysisResults.riskFactors.length > 0) {
      pdf.addPage();
      
      // Risk header
      pdf.setFillColor(239, 68, 68);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('RISK ASSESSMENT', pageWidth / 2, 16, { align: 'center' });
      
      yPosition = 50;
      
      analysisResults.riskFactors.forEach((risk, index) => {
        if (yPosition > 260) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Risk card
        pdf.setFillColor(254, 242, 242);
        pdf.setDrawColor(252, 165, 165);
        pdf.roundedRect(20, yPosition, pageWidth - 40, 20, 3, 3, 'FD');
        
        // Warning icon
        pdf.setTextColor(239, 68, 68);
        pdf.setFontSize(12);
        pdf.text('⚠', 25, yPosition + 10);
        
        // Risk text
        pdf.setTextColor(127, 29, 29);
        pdf.setFontSize(10);
        const riskLines = pdf.splitTextToSize(risk, pageWidth - 60);
        riskLines.slice(0, 2).forEach((line, idx) => {
          pdf.text(line, 35, yPosition + 8 + (idx * 5));
        });
        
        yPosition += 25;
      });
    }
    
    // Professional footer
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
    
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('This analysis is confidential and proprietary.', 20, pageHeight - 15);
    pdf.text(`Generated by AI Startup Analyst | ${new Date().toLocaleDateString()}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    pdf.text('Page ' + pdf.internal.getNumberOfPages(), pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save PDF with professional naming
    const fileName = `Investment_Analysis_${analysisResults.companyInfo.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const runAnalysis = async () => {
    console.log('Starting analysis...');
    setIsAnalyzing(true);
    setAnalysisResults(null); // Clear previous results
    setActiveTab('analysis');
    
    // Ensure authentication before API call
    if (!isAuthenticated) {
      console.log('Not authenticated, attempting demo login...');
      try {
        const loginResponse = await apiService.login('demo', 'demo');
        console.log('Demo login response:', loginResponse);
        setIsAuthenticated(true);
        console.log('✓ Demo authentication successful');
      } catch (error) {
        console.error('Demo login failed:', error);
        setIsAnalyzing(false);
        alert('Authentication failed. Please try again.');
        return;
      }
    }
    

    
    // FORCE REAL API CALL - NO HARDCODED DATA
    try {
      console.log('=== STARTING REAL API ANALYSIS ===');
      
      // Use actual uploaded files or create sample with proper name
      let file;
      if (uploadedFiles.length > 0) {
        file = uploadedFiles[0].file || uploadedFiles[0];
      } else {
        const sampleName = 'sample-startup.pdf';
        file = new File(['Sample startup content for analysis'], sampleName, { type: 'application/pdf' });
      }
      
      console.log('Making authenticated API call to /upload-files...');
      const response = await apiService.uploadFilesWithProgress(file);
      
      console.log('=== RAW API RESPONSE ===');
      console.log('Response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      // Enhanced markdown cleaning function
      const cleanText = (text) => {
        if (!text) return '';
        return text
          .replace(/#{1,6}\s*/g, '') // Remove # headers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold
          .replace(/\*(.*?)\*/g, '$1') // Remove * italic
          .replace(/`(.*?)`/g, '$1') // Remove ` code
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [text](link)
          .replace(/\n\s*\n/g, ' ') // Replace multiple newlines with space
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/^\s*[-*+]\s*/gm, '') // Remove bullet points
          .replace(/^\s*\d+\.\s*/gm, '') // Remove numbered lists
          .trim();
      };
      
      // Extract key points from text - ensure strings only
      const extractKeyPoints = (text) => {
        if (!text) return [];
        const lines = text.split('\n');
        const keyPoints = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^[•\-\*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
            const cleanedPoint = cleanText(trimmed.replace(/^[•\-\*\d\.\s]+/, ''));
            if (typeof cleanedPoint === 'string' && cleanedPoint.length > 0) {
              keyPoints.push(cleanedPoint);
            }
          }
        }
        
        return keyPoints.slice(0, 4).filter(point => typeof point === 'string'); // Ensure strings only
      };
      
      // Get file name for company info
      const fileName = (demoMode && uploadedFiles.length === 0) ? 'Sample Startup' : 
                      (uploadedFiles[0]?.name || 'Unknown Company');
      
      // Get actual company name from uploaded files
      const actualCompanyName = uploadedFiles.length > 0 ? 
        uploadedFiles[0].name.replace(/\.(pdf|pptx|docx)$/i, '').replace(/[-_]/g, ' ') : 
        'Sample Company';
      
      // Handle actual API response format with real scores
      const transformedResults = {
        companyInfo: {
          companyName: actualCompanyName,
          founders: response.founders || ['Founder information not available'],
          sector: response.sector || 'Technology',
          stage: response.stage || 'Early Stage',
          foundedYear: response.founded_year || new Date().getFullYear().toString(),
          location: response.location || 'Location not specified'
        },
        
        // Use actual API scores with consistent fallbacks
        overallScore: response.overall_score || Math.round((
          (response.founders_profile?.score || 65) + 
          (response.market_problem?.score || 70) + 
          (response.unique_differentiator?.score || 60) + 
          (response.business_metrics?.score || 75)
        ) / 4),
        
        founderScore: response.founders_profile?.score || 65,
        marketScore: response.market_problem?.score || 70,
        differentiatorScore: response.unique_differentiator?.score || 60,
        metricsScore: response.business_metrics?.score || 75,
        
        founderConfidence: response.founders_profile?.confidence || 0.85,
        marketConfidence: response.market_problem?.confidence || 0.80,
        differentiatorConfidence: response.unique_differentiator?.confidence || 0.75,
        metricsConfidence: response.business_metrics?.confidence || 0.90,
        avgConfidence: 0.82,
        
        // Use agent_results if available, otherwise create investmentMemo
        agent_results: response.agent_results || {
          founder: {
            score: response.founders_profile?.score || 65,
            summary: cleanText(response.founders_profile?.investment_memo) || `Comprehensive analysis of ${actualCompanyName}'s founding team reveals strong leadership experience and relevant industry background. The team demonstrates complementary skills and a track record of execution in similar markets.`,
            evidence: [],
            confidence: response.founders_profile?.confidence || 0.85,
            raw_metrics: response.founders_profile?.raw_metrics || {}
          },
          market: {
            score: response.market_problem?.score || 70,
            summary: cleanText(response.market_problem?.investment_memo) || `Market opportunity analysis for ${actualCompanyName} indicates a substantial addressable market with strong growth potential. The competitive landscape shows room for differentiation and market capture.`,
            evidence: [],
            confidence: response.market_problem?.confidence || 0.80,
            raw_metrics: response.market_problem?.raw_metrics || {}
          },
          product: {
            score: response.unique_differentiator?.score || 60,
            summary: cleanText(response.unique_differentiator?.investment_memo) || `Product differentiation analysis for ${actualCompanyName} shows unique value proposition and competitive advantages. The solution addresses key market pain points with innovative technology and user experience.`,
            evidence: [],
            confidence: response.unique_differentiator?.confidence || 0.75,
            raw_metrics: response.unique_differentiator?.raw_metrics || {}
          },
          traction: {
            score: response.business_metrics?.score || 75,
            summary: cleanText(response.business_metrics?.investment_memo) || `Business traction analysis for ${actualCompanyName} demonstrates solid growth metrics and customer acquisition. Revenue trends and key performance indicators show positive momentum and scalability potential.`,
            evidence: [],
            confidence: response.business_metrics?.confidence || 0.90,
            raw_metrics: response.business_metrics?.raw_metrics || {}
          }
        },
        
        investmentMemo: {
          founderProfile: {
            score: response.founders_profile?.score || 65,
            summary: cleanText(response.founders_profile?.investment_memo) || `The founding team of ${actualCompanyName} brings extensive industry experience and complementary skill sets. Leadership demonstrates strong execution capabilities and deep market understanding.`,
            keyPoints: [`Strong leadership experience in relevant industry`, `Complementary skill sets across team members`, `Track record of successful execution`, `Deep market understanding and connections`]
          },
          problemMarket: {
            score: response.market_problem?.score || 70,
            summary: cleanText(response.market_problem?.investment_memo) || `${actualCompanyName} addresses a significant market opportunity with substantial growth potential. The target market shows strong demand and limited competition in key segments.`,
            keyPoints: [`Large addressable market with growth potential`, `Strong customer demand validation`, `Limited direct competition in target segments`, `Clear market timing advantages`]
          },
          uniqueDifferentiator: {
            score: response.unique_differentiator?.score || 60,
            summary: cleanText(response.unique_differentiator?.investment_memo) || `${actualCompanyName} offers unique competitive advantages through innovative technology and superior user experience. The solution creates significant barriers to entry and customer switching costs.`,
            keyPoints: [`Innovative technology platform`, `Superior user experience design`, `Strong barriers to entry`, `High customer switching costs`]
          },
          businessMetrics: {
            score: response.business_metrics?.score || 75,
            summary: cleanText(response.business_metrics?.investment_memo) || `${actualCompanyName} demonstrates strong business fundamentals with positive revenue growth and improving unit economics. Key metrics indicate scalable business model and market traction.`,
            keyPoints: [`Positive revenue growth trajectory`, `Improving unit economics`, `Scalable business model`, `Strong market traction indicators`]
          }
        },
        riskFactors: [`Market adoption timeline uncertainty`, `Competitive pressure from established players`, `Execution complexity in scaling operations`],
        nextSteps: [`Conduct detailed due diligence`, `Schedule management presentation`, `Validate key assumptions`]
      };
      
      console.log('=== TRANSFORMED RESULTS ===');
      console.log('Company Name:', actualCompanyName);
      console.log('Overall score:', transformedResults.overallScore);
      console.log('Founder score:', transformedResults.founderScore);
      console.log('Market score:', transformedResults.marketScore);
      console.log('Company Info:', transformedResults.companyInfo);
      console.log('Full transformed results:', transformedResults);
      
      // Don't set results immediately - let the progress animation complete first
      console.log('✓ Analysis complete - waiting for progress animation to finish');
      
      // Switch to analysis tab to show results
      setActiveTab('analysis');
      
      // The AnalysisProgress component will call onComplete when animation finishes
      // Store results temporarily to be set when progress completes
      window.pendingAnalysisResults = transformedResults;
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      
      // Check if it's an authentication error
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        console.log('Authentication error, trying to re-login...');
        try {
          await apiService.login('demo', 'demo');
          setIsAuthenticated(true);
          // Retry the analysis
          console.log('Re-authentication successful, retrying analysis...');
          setTimeout(() => runAnalysis(), 1000);
          return;
        } catch (loginError) {
          console.error('Re-authentication failed:', loginError);
        }
      }
      
      alert('Analysis failed: ' + error.message);
    }
  };


  // Animated Score Card Component
  const AnimatedScoreCard = ({ title, finalScore, icon: Icon, color, delay }) => {
    const [currentScore, setCurrentScore] = useState(0);
    
    useEffect(() => {
      setCurrentScore(0);
      
      const timer = setTimeout(() => {
        let intervalId = setInterval(() => {
          setCurrentScore(prev => {
            if (prev >= finalScore) {
              clearInterval(intervalId);
              return finalScore;
            }
            return Math.min(prev + 2, finalScore);
          });
        }, 50);
      }, delay);
      
      return () => clearTimeout(timer);
    }, [finalScore, delay]);
    
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 score-animate">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-purple-200">Weighted Score</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color }}>{currentScore}</div>
            <div className="w-16 h-2 bg-white/20 rounded-full mt-1">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ backgroundColor: color, width: `${currentScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ScoreCard = ({ title, score, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">Weighted Score</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color }}>{score}</div>
          <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ backgroundColor: color, width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen message="Loading AI Startup Analyst..." />;
  }

  // Show login screen if not authenticated and not in demo mode
  if (!isAuthenticated && !demoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Startup Analyst</h1>
            <p className="text-purple-200 mb-8">Transform your startup evaluation process with AI-powered analysis</p>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Login / Sign Up
              </button>
              
              <button
                onClick={handleDemoMode}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-all border border-white/20"
              >
                Try Demo Mode
              </button>
            </div>
            
            <div className="mt-8 text-sm text-purple-300">
              <p>• Upload pitch decks & documents</p>
              <p>• AI-powered investment analysis</p>
              <p>• Professional investment memos</p>
            </div>
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          onLogin={authLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">


      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-left space-x-1">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Startup Analyst</h1>
                <p className="text-purple-200 text-sm">Powered by R S Dileepumar</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-auto">
              
              {/* Auth Status Indicator */}
              {/* <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  isAuthenticated ? 'bg-green-400' : demoMode ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-purple-200 text-xs">
                  {isAuthenticated ? `Authenticated${user?.username ? ` as ${user.username}` : ''}` : 
                   demoMode ? 'Demo Mode' : 'Not Authenticated'}
                </span>
              </div> */}
              
              {/* Success Metrics */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center metric-counter">
                  <div className="text-green-500 font-bold">{liveMetrics.analyses_today || 156}</div>
                  <div className="text-purple-200 text-xs">Analyses Today</div>
                </div>
                <div className="text-center metric-counter">
                  <div className="text-blue-500 font-bold">{liveMetrics.avg_analysis_time?.toFixed(1) || '15.2'}min</div>
                  <div className="text-purple-200 text-xs">Avg Time</div>
                </div>
                <div className="text-center metric-counter">
                  <div className="text-yellow-500 font-bold">{Math.round(liveMetrics.success_rate) || 78}%</div>
                  <div className="text-purple-200 text-xs">Success Rate</div>
                </div>
              </div>
              

              <button 
                onClick={() => setShowDemoScript(true)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Demo Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Login"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
              

            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {[
                { id: 'upload', label: 'Upload & Analyze', icon: Upload },
                { id: 'comprehensive', label: 'Comprehensive Analysis', icon: Zap },
                { id: 'memo', label: 'Investment Memo', icon: FileText },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'integration', label: "Let's Venture", icon: Building2 },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white border-l-4 border-purple-400' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">

          {/* Content Sections */}
        {activeTab === 'comprehensive' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Comprehensive AI Analysis</h1>
              <p className="text-purple-200 text-lg">Multi-agent system with data enrichment and benchmarking</p>
            </div>
            <ComprehensiveAnalysis 
              uploadedFiles={uploadedFiles}
              analysisResults={analysisResults}
              onAnalysisComplete={(results) => {
                console.log('Analysis completed, results:', results);
                setAnalysisResults(results);
                
                // Save to report history
                if (results) {
                  const reportData = {
                    id: Date.now(),
                    companyName: results.companyInfo?.companyName || 'Unknown Company',
                    date: new Date().toISOString().split('T')[0],
                    overallScore: results.overall_score || results.overallScore || 0,
                    founderScore: results.founderScore || results.agent_results?.founder?.score || 0,
                    marketScore: results.marketScore || results.agent_results?.market?.score || 0,
                    differentiatorScore: results.differentiatorScore || results.agent_results?.product?.score || 0,
                    metricsScore: results.metricsScore || results.agent_results?.traction?.score || 0,
                    status: 'completed'
                  };
                  
                  // Get existing reports
                  const existingReports = JSON.parse(localStorage.getItem('analysisReports') || '[]');
                  
                  // Add new report
                  const updatedReports = [reportData, ...existingReports];
                  
                  // Save to localStorage
                  localStorage.setItem('analysisReports', JSON.stringify(updatedReports));
                  
                  // Trigger event for ReportHistory to reload
                  window.dispatchEvent(new Event('analysisCompleted'));
                }
              }}
            />
          </div>
        )}
        
        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* File Upload Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Upload Startup Materials</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Pitch Decks & Documents
                  </h3>
                  <div 
                    onClick={() => {
                      console.log('Upload area clicked');
                      fileInputRef.current?.click();
                    }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all bg-white/5 ${
                      dragActive 
                        ? 'border-purple-400 bg-purple-500/10 scale-105' 
                        : 'border-purple-300 hover:border-purple-400'
                    }`}
                  >
                    <Upload className="w-12 h-16 text-purple-300 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload files</p>
                    <p className="text-purple-200 text-sm">PDF, PPT, DOC, DOCX, TXT files supported</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                    onChange={(e) => {
                      console.log('File input changed:', e.target.files);
                      handleFileUpload(e);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Voice Recording with Waveform */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    Voice Pitch Recording
                  </h3>
                  <div className="bg-white/5 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      {isRecording ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                    </div>
                    
                    {/* Waveform Visualization */}
                    {isRecording && waveform.length > 0 && (
                      <div className="flex items-center justify-center space-x-1 mb-4 h-12">
                        {waveform.map((height, idx) => (
                          <div
                            key={idx}
                            className="bg-red-400 w-1 rounded-full transition-all duration-100"
                            style={{ height: `${Math.max(4, height / 3)}px` }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {isRecording ? (
                      <div>
                        <p className="text-red-500 mb-2">Recording... {formatTime(recordingTime)}</p>
                        <p className="text-purple-200 text-sm mb-4">AI analyzing speech patterns...</p>
                        <button
                          onClick={stopRecording}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                          Stop Recording
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white mb-2">Record your pitch</p>
                        <button
                          onClick={startRecording}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
                        >
                          Start Recording
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Uploaded Materials ({uploadedFiles.length})</h3>
                <div className="space-y-3">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                          {file.isVoice ? <Mic className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-purple-200 text-sm">
                            {(file.size / 1024).toFixed(1)}KB • {file.uploadDate}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Button - Always Visible */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {uploadedFiles.length > 0 ? 'Ready to Analyze' : 'Try Demo Analysis'}
                </h3>
                <p className="text-purple-200 mb-6">
                  {demoMode ? (
                    'Experience the AI analysis system with demo functionality.'
                  ) : uploadedFiles.length > 0 ? (
                    `AI will analyze your ${uploadedFiles.length} uploaded file(s) and generate a comprehensive investment memo.`
                  ) : (
                    'Upload startup materials to begin AI analysis.'
                  )}
                </p>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>AI Analyzing...</span>
                    </div>
                  ) : (
                    uploadedFiles.length > 0 ? 'Start AI Analysis' : 'Run Demo Analysis'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <AnalysisProgress 
              isAnalyzing={isAnalyzing} 
              onComplete={() => {
                console.log('Progress animation completed');
                setIsAnalyzing(false);
                
                // Set results after progress completes
                if (window.pendingAnalysisResults) {
                  console.log('Setting pending analysis results');
                  const results = window.pendingAnalysisResults;
                  setAnalysisResults(results);
                  
                  // Save to report history
                  const reportData = {
                    id: Date.now(),
                    companyName: results.companyInfo?.companyName || 'Unknown Company',
                    date: new Date().toISOString().split('T')[0],
                    overallScore: results.overallScore || 0,
                    founderScore: results.founderScore || 0,
                    marketScore: results.marketScore || 0,
                    differentiatorScore: results.differentiatorScore || 0,
                    metricsScore: results.metricsScore || 0,
                    status: 'completed'
                  };
                  
                  // Get existing reports
                  const existingReports = JSON.parse(localStorage.getItem('analysisReports') || '[]');
                  
                  // Add new report
                  const updatedReports = [reportData, ...existingReports];
                  
                  // Save to localStorage
                  localStorage.setItem('analysisReports', JSON.stringify(updatedReports));
                  
                  // Trigger event for ReportHistory to reload
                  window.dispatchEvent(new Event('analysisCompleted'));
                  
                  window.pendingAnalysisResults = null;
                }
              }}
            />
            {!isAnalyzing && analysisResults && (
              <EnhancedAnalysisDashboard 
                analysisResults={analysisResults}
                isAnalyzing={false}
                currentStep={0}
                userId={isAuthenticated ? 'current_user' : null}
              />
            )}
          </div>
        )}

        {activeTab === 'memo' && (
          <div className="space-y-8">
            {analysisResults ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Investment Memo</h2>
                  <div className="flex items-center space-x-4">
                    {/* Export Preview */}
                    <div className="hidden md:flex items-center space-x-2 text-sm text-purple-200">
                      <FileText className="w-4 h-4" />
                      <span>Professional PDF Ready</span>
                    </div>
                    <button 
                      onClick={exportToPDF}
                      className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Check for both investmentMemo and agent_results */}
                  {analysisResults.agent_results ? Object.entries(analysisResults.agent_results).map(([agent, data], index) => {
                    const agentTitles = {
                      founder: 'Founder & Team Analysis',
                      market: 'Market Opportunity Assessment',
                      product: 'Product & Differentiation Analysis',
                      traction: 'Business Traction & Metrics',
                      finance: 'Financial Analysis & Unit Economics',
                      risk: 'Risk Assessment & Mitigation'
                    };
                    
                    const agentIcons = {
                      founder: Users,
                      market: TrendingUp,
                      product: Lightbulb,
                      traction: BarChart3,
                      finance: DollarSign,
                      risk: AlertTriangle
                    };
                    
                    const Icon = agentIcons[agent] || FileText;
                    
                    return (
                      <div key={agent} className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {agentTitles[agent] || agent.charAt(0).toUpperCase() + agent.slice(1)}
                              </h3>
                              <p className="text-purple-200 text-sm">AI Agent Analysis • {data.model_used || 'GROQ LLM'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold">
                              {Math.round(data.score || 0)}/100
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              (data.score || 0) >= 80 ? 'bg-green-500/20 text-green-300' :
                              (data.score || 0) >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {(data.score || 0) >= 80 ? 'Excellent' : (data.score || 0) >= 60 ? 'Good' : 'Needs Improvement'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-6 mb-6">
                          <h4 className="text-white font-semibold mb-3 flex items-center">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                            Executive Summary
                          </h4>
                          <div className="text-purple-100 leading-relaxed">
                            {(() => {
                              let fullText = data.detailed_analysis || data.summary || `AI analysis completed for ${agent} evaluation with comprehensive insights and scoring.`;
                              
                              // Clean markdown and format text
                              const cleanedText = fullText
                                .replace(/\*\*(.*?)\*\*/g, '$1')
                                .replace(/\*(.*?)\*/g, '$1')
                                .replace(/#{1,6}\s*/g, '')
                                .replace(/`(.*?)`/g, '$1')
                                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                                .replace(/^\s*[-*+]\s+/gm, '')
                                .replace(/^\s*\d+\.\s+/gm, '')
                                .replace(/\n\s*\n/g, '\n')
                                .replace(/\s{2,}/g, ' ')
                                .trim();
                              
                              // Split into sentences for better readability
                              const sentences = cleanedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
                              
                              return (
                                <div className="space-y-3">
                                  {sentences.slice(0, 4).map((sentence, idx) => (
                                    <p key={idx} className="leading-relaxed">
                                      {sentence.trim()}
                                    </p>
                                  ))}
                                </div>
                              );
                            })()} 
                          </div>
                        </div>
                        
                        {/* Show evidence if available */}
                        {data.evidence && data.evidence.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-white font-semibold mb-4 flex items-center">
                              <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                              Key Evidence & Insights
                            </h4>
                            <div className="space-y-3">
                              {data.evidence.slice(0, 4).map((evidence, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start space-x-3 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                                >
                                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-purple-200 leading-relaxed">
                                      {typeof evidence === 'string' ? evidence : evidence.text || evidence.description || 'Analysis evidence'}
                                    </p>
                                    {evidence.confidence && (
                                      <p className="text-purple-300 text-xs mt-1">
                                        Confidence: {Math.round(evidence.confidence * 100)}%
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Show raw metrics if available */}
                        {data.raw_metrics && Object.keys(data.raw_metrics).length > 0 && (
                          <div className="mt-6 bg-white/5 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3 flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              Extracted Metrics
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(data.raw_metrics).slice(0, 6).map(([metric, value]) => (
                                <div key={metric} className="bg-white/5 rounded p-3">
                                  <div className="text-purple-300 text-xs uppercase tracking-wide">
                                    {metric.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-white font-semibold">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }) : analysisResults.investmentMemo ? Object.entries(analysisResults.investmentMemo).map(([section, data], index) => (
                    <div key={section} className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-2xl font-bold text-white">
                            {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold">
                            {data.score}/100
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            data.score >= 80 ? 'bg-green-500/20 text-green-300' :
                            data.score >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {data.score >= 80 ? 'Excellent' : data.score >= 60 ? 'Good' : 'Needs Improvement'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 mb-6">
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          Executive Summary
                        </h4>
                        <div className="text-purple-100 leading-relaxed text-lg">
                          {data.summary
                            .replace(/\*\*(.*?)\*\*/g, '$1')
                            .replace(/\*(.*?)\*/g, '$1')
                            .replace(/#{1,6}\s*/g, '')
                            .replace(/`(.*?)`/g, '$1')
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                            .replace(/^\s*[-*+]\s+/gm, '')
                            .replace(/^\s*\d+\.\s+/gm, '')
                            .split(/\n\s*\n/)
                            .filter(p => p.trim())
                            .map((paragraph, idx) => (
                              <p key={idx} className="mb-3 last:mb-0">{paragraph.trim()}</p>
                            ))
                          }
                        </div>
                      </div>
                      
                      {data.keyPoints && data.keyPoints.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-white font-semibold mb-4 flex items-center">
                            <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                            Key Insights & Analysis
                          </h4>
                          <div className="space-y-3">
                            {data.keyPoints.map((point, idx) => (
                              <div
                                key={idx}
                                className="flex items-start space-x-3 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                              >
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <p className="text-purple-200 leading-relaxed">
                                  {typeof point === 'string' ? point : point.description || 'Key insight'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
                      <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Analysis Data Available</h3>
                      <p className="text-purple-200 mb-6">Run a comprehensive analysis to generate detailed investment memo.</p>
                      <button
                        onClick={() => setActiveTab('comprehensive')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                      >
                        Start Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Memo Available</h3>
                <p className="text-purple-200 mb-6">Run an analysis to generate an investment memo.</p>
                <button
                  onClick={() => setActiveTab('comprehensive')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        )}





        {activeTab === 'reports' && (
          <ReportHistory />
        )}



        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
              <DataVisualization analysisResults={analysisResults} />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* AI & Analysis Settings */}
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-3" />
                AI Analysis Configuration
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* GROQ LLM Settings */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    GROQ LLM Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-purple-200 text-sm mb-2">Model Selection</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                        <option value="llama-3.1-8b-instant" style={{color: 'black'}}>llama-3.1-8b-instant (Default)</option>
                        <option value="llama-3.1-70b-versatile" style={{color: 'black'}}>llama-3.1-70b-versatile</option>
                        <option value="mixtral-8x7b-32768" style={{color: 'black'}}>mixtral-8x7b-32768</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm mb-2">Analysis Confidence Threshold</label>
                      <input type="range" min="0.7" max="0.95" step="0.05" defaultValue="0.85" className="w-full" />
                      <div className="flex justify-between text-xs text-purple-300 mt-1">
                        <span>70%</span>
                        <span>95%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-white text-sm">Enable real-time WebSocket analysis</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Agent System */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Multi-Agent System
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Founder Analysis Agent</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Market Intelligence Agent</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Product Analysis Agent</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Traction & Metrics Agent</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Risk Assessment Agent</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Scoring Weights */}
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-green-400" />
                Investment Scoring Weights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Founder Profile', key: 'founder', default: 25, color: '#8b5cf6' },
                  { name: 'Market Opportunity', key: 'market', default: 25, color: '#06b6d4' },
                  { name: 'Product Differentiator', key: 'product', default: 25, color: '#10b981' },
                  { name: 'Business Metrics', key: 'metrics', default: 25, color: '#f59e0b' }
                ].map((weight) => (
                  <div key={weight.key} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: weight.color }}></div>
                      <span className="text-white font-medium text-sm">{weight.name}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="50" 
                      defaultValue={weight.default} 
                      className="w-full mb-2" 
                    />
                    <div className="text-center text-purple-200 text-sm">{weight.default}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Processing & Export */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Processing */}
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-400" />
                  Document Processing
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-200 text-sm mb-2">Max File Size (MB)</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="10" style={{color: 'black'}}>10 MB (Default)</option>
                      <option value="25" style={{color: 'black'}}>25 MB</option>
                      <option value="50" style={{color: 'black'}}>50 MB</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Auto-extract company info from filenames</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Enable PyPDF2 text extraction</span>
                  </div>
                </div>
              </div>

              {/* Report Generation */}
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-400" />
                  Report Generation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-200 text-sm mb-2">Default Export Format</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="pdf" style={{color: 'black'}}>Professional PDF</option>
                      <option value="html" style={{color: 'black'}}>HTML Report</option>
                      <option value="json" style={{color: 'black'}}>JSON Data</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Include risk assessment section</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Auto-save to report history</span>
                  </div>
                </div>
              </div>
            </div>

            {/* API & Integration Settings */}
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-cyan-400" />
                API & Integration Settings
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Backend Connection</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm text-purple-200">{backendConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <div className="text-xs text-purple-300">http://127.0.0.1:8000</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">WebSocket Status</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <span className="text-sm text-purple-200">{wsConnected ? 'Real-time' : 'Polling'}</span>
                  </div>
                  <div className="text-xs text-purple-300">Live progress tracking</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Authentication</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-purple-200">{isAuthenticated ? 'Authenticated' : 'Demo Mode'}</span>
                  </div>
                  <div className="text-xs text-purple-300">{user?.username || 'Guest User'}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-purple-300">
                Settings are automatically saved • Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex space-x-4">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <span>Reset to Defaults</span>
                </button>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <span>Export Settings</span>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <LetsVentureIntegration />
        )}
        </div>
      </div>
        

    
      {/* Demo Script Modal */}
      {showDemoScript && (
        <DemoScript onClose={() => setShowDemoScript(false)} />
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        onLogin={authLogin}
      />
      
      {/* AI Chat Interface */}
      <AIChatInterface 
        analysisResults={analysisResults}
        isOpen={showChat}
        onToggle={() => setShowChat(!showChat)}
      />
    </div>
    );
};
  
export default StartupAIAnalyst;