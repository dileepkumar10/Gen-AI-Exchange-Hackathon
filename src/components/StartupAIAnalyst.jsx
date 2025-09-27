import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Mic, Users, TrendingUp, Lightbulb, DollarSign, Star, Download, Settings, Play, Pause, Activity, Globe, BarChart3, Zap, HelpCircle, Building2, LogOut, User } from 'lucide-react';
import jsPDF from 'jspdf';
import DemoScript from './DemoScript';
import LetsVentureIntegration from './LetsVentureIntegration';
import AuthModal from './AuthModal';
import apiService from '../services/api';
import './animations.css';

const StartupAIAnalyst = () => {
  const [activeTab, setActiveTab] = useState('upload');
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [showLoginFirst, setShowLoginFirst] = useState(true);
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

  // AI Progress Steps
  const aiSteps = [
    { name: "Data Extraction Agent", icon: "📄", description: "Parsing documents..." },
    { name: "Public Data Agent", icon: "🌐", description: "Gathering market intel..." },
    { name: "Analysis Agent", icon: "📊", description: "Computing scores..." },
    { name: "Memo Generation Agent", icon: "📝", description: "Creating report..." }
  ];

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

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      return;
    }
    
    if (!isAuthenticated && !demoMode) {
      setShowAuthModal(true);
      return;
    }
    
    // Always add files to state for display
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toLocaleDateString(),
      file: file
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Clear the input value to allow re-uploading the same file
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

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiService.healthCheck();
        setBackendConnected(true);
      } catch (error) {
        console.log('Backend not connected, using demo mode');
        setBackendConnected(false);
        setDemoMode(true);
      }
    };
    checkBackend();
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
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setShowLoginFirst(false);
    setDemoMode(false);
  };

  const handleDemoMode = () => {
    setShowLoginFirst(false);
    setDemoMode(true);
    setIsAuthenticated(false);
  };

  // AI progress tracker effect
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % aiSteps.length);
      }, 750);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

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
    if (!isAuthenticated && !demoMode) {
      setShowAuthModal(true);
      return;
    }
    
    console.log('Starting analysis...');
    setIsAnalyzing(true);
    setActiveTab('analysis');
    setCurrentStep(0);
    
    // Enhanced company detection
    const detectedCompany = detectCompanyType(uploadedFiles);
    const firstFileName = uploadedFiles.length > 0 ? uploadedFiles[0].name : '';
    let companyData = getDefaultStartupData(firstFileName);
    let analysisData = {
      overallScore: 78,
      founderScore: 85,
      marketScore: 72,
      differentiatorScore: 80,
      metricsScore: 75
    };

    // Check if Uber-related files are uploaded
    const hasUberFile = uploadedFiles.some(file => 
      file.name.toLowerCase().includes('uber') || 
      file.name.toLowerCase().includes('ride') ||
      file.name.toLowerCase().includes('transport')
    ) || detectedCompany?.name === 'Uber Technologies';

    if (hasUberFile) {
      companyData = {
        companyName: "Uber Technologies",
        founders: ["Travis Kalanick", "Garrett Camp"],
        sector: "Transportation/Mobility",
        stage: "Public Company",
        foundedYear: "2009",
        location: "San Francisco, CA"
      };
      analysisData = {
        overallScore: 92,
        founderScore: 88,
        marketScore: 95,
        differentiatorScore: 90,
        metricsScore: 94
      };
    }
    
    if (demoMode) {
      // Demo mode - simulate analysis
      setTimeout(() => {
        console.log('Demo analysis complete, setting results...');
      const mockAnalysis = {
        ...analysisData,
        companyInfo: companyData,
        investmentMemo: hasUberFile ? {
          founderProfile: {
            score: 88,
            summary: "Exceptional founding team with Travis Kalanick (serial entrepreneur, Red Swoosh exit) and Garrett Camp (StumbleUpon founder). Strong technical and business complementarity with proven track record in consumer internet.",
            keyPoints: [
              "Travis: Previous startup exit with Red Swoosh",
              "Garrett: Founded and scaled StumbleUpon to 25M+ users",
              "Deep understanding of consumer behavior and scalability",
              "Strong technical background in distributed systems"
            ]
          },
          problemMarket: {
            score: 95,
            summary: "Addressing the massive $1.3T global transportation market. Clear consumer pain point with fragmented taxi industry and poor user experience. Huge TAM with global expansion potential.",
            keyPoints: [
              "TAM: $1.3T global transportation market",
              "Taxi industry ripe for disruption - poor UX, limited supply",
              "Mobile-first approach leveraging smartphone adoption",
              "Network effects create strong competitive moats"
            ]
          },
          uniqueDifferentiator: {
            score: 90,
            summary: "Revolutionary two-sided marketplace model connecting riders and drivers through mobile technology. First-mover advantage in on-demand transportation with strong network effects.",
            keyPoints: [
              "Two-sided marketplace with network effects",
              "Real-time GPS tracking and dynamic pricing",
              "Cashless payment integration",
              "First-mover advantage in multiple markets"
            ]
          },
          businessMetrics: {
            score: 94,
            summary: "Explosive growth trajectory with strong unit economics. High customer retention, expanding from premium to mass market segments. Clear path to profitability through scale.",
            keyPoints: [
              "Rapid user acquisition and high retention rates",
              "Strong unit economics in mature markets",
              "Multiple revenue streams (rides, delivery, freight)",
              "Global expansion strategy with localization"
            ]
          }
        } : {
          founderProfile: {
            score: analysisData.founderScore,
            summary: "Strong founder-market fit with Sarah Chen (ex-Tesla engineer, 8 years cleantech experience) and Mike Rodriguez (Stanford MBA, previous startup exit). Complementary skills in technology and business.",
            keyPoints: [
              "Sarah: Deep technical expertise in battery technology",
              "Mike: Strong business acumen and fundraising experience",
              "Previous collaboration on 2 successful projects",
              "Combined network spans both tech and energy sectors"
            ]
          },
          problemMarket: {
            score: analysisData.marketScore,
            summary: "Addressing the $2.1B energy storage market with 15% CAGR. Clear problem validation through 50+ customer interviews and LOIs from 3 major utilities.",
            keyPoints: [
              "TAM: $2.1B energy storage market",
              "Growing 15% annually driven by renewable adoption",
              "Direct competitors include Tesla Powerwall, Enphase",
              "Differentiated by focus on commercial/industrial segment"
            ]
          },
          uniqueDifferentiator: {
            score: analysisData.differentiatorScore,
            summary: "Patent-pending solid-state battery technology with 40% higher energy density and 50% faster charging compared to lithium-ion alternatives.",
            keyPoints: [
              "2 patents filed, 1 provisional approved",
              "40% improvement in energy density",
              "Proprietary thermal management system",
              "Exclusive partnerships with 2 material suppliers"
            ]
          },
          businessMetrics: {
            score: analysisData.metricsScore,
            summary: "$150K ARR with 3 pilot customers. Strong unit economics with 65% gross margins. Seeking $2M Series A for manufacturing scale-up.",
            keyPoints: [
              "Current ARR: $150K with 150% YoY growth",
              "3 pilot customers, 8 in pipeline",
              "Gross margins: 65%",
              "12-month runway, seeking $2M Series A"
            ]
          }
        },
        riskFactors: hasUberFile ? [
          "Regulatory challenges in multiple jurisdictions",
          "Driver classification and labor law issues",
          "Intense competition from well-funded rivals",
          "High customer acquisition costs"
        ] : [
          "Regulatory approval timeline uncertainty",
          "High capital requirements for scaling",
          "Intense competition from established players"
        ],
        nextSteps: hasUberFile ? [
          "Deep dive on regulatory strategy and legal framework",
          "Analyze unit economics and path to profitability",
          "Evaluate competitive moats and defensibility",
          "Review international expansion timeline and strategy"
        ] : [
          "Schedule founder interview to deep-dive on technology",
          "Conduct technical due diligence with domain expert",
          "Review detailed financial projections and use of funds"
        ]
      };
      
        setAnalysisResults(mockAnalysis);
        setIsAnalyzing(false);
        console.log('Demo state updated successfully');
      }, 3000);
    } else {
      // Live mode - call backend API
      try {
        if (uploadedFiles.length === 0) {
          alert('Please upload files first');
          setIsAnalyzing(false);
          return;
        }
        
        // Upload files and get analysis
        const file = uploadedFiles[0].file;
        const response = await apiService.uploadFiles(file);
        
        // Clean markdown formatting function
        const cleanText = (text) => {
          return text
            .replace(/#{1,6}\s*/g, '') // Remove # headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold
            .replace(/\*(.*?)\*/g, '$1') // Remove * italic
            .replace(/`(.*?)`/g, '$1') // Remove ` code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [text](link)
            .trim();
        };
        
        // Transform backend response to frontend format
        const transformedResults = {
          companyInfo: {
            companyName: file.name.replace(/\.(pdf|pptx|docx|ppt|doc)$/i, '').replace(/[-_]/g, ' '),
            founders: ['Analysis from uploaded document'],
            sector: 'Analyzed from document',
            stage: 'Document analysis',
            foundedYear: new Date().getFullYear().toString(),
            location: 'Location from document'
          },
          overallScore: Math.round((
            (response.founders_profile?.score || 75) + 
            (response.market_problem?.score || 75) + 
            (response.unique_differentiator?.score || 75) + 
            (response.business_metrics?.score || 75)
          ) / 4),
          founderScore: response.founders_profile?.score || 75,
          marketScore: response.market_problem?.score || 75,
          differentiatorScore: response.unique_differentiator?.score || 75,
          metricsScore: response.business_metrics?.score || 75,
          investmentMemo: {
            founderProfile: {
              score: response.founders_profile.score,
              summary: cleanText(response.founders_profile.investment_memo),
              keyPoints: response.founders_profile.investment_memo.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => cleanText(line.replace(/^\d+\.\s*/, '')))
            },
            problemMarket: {
              score: response.market_problem.score,
              summary: cleanText(response.market_problem.investment_memo),
              keyPoints: response.market_problem.investment_memo.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => cleanText(line.replace(/^\d+\.\s*/, '')))
            },
            uniqueDifferentiator: {
              score: response.unique_differentiator.score,
              summary: cleanText(response.unique_differentiator.investment_memo),
              keyPoints: response.unique_differentiator.investment_memo.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => cleanText(line.replace(/^\d+\.\s*/, '')))
            },
            businessMetrics: {
              score: response.business_metrics.score,
              summary: cleanText(response.business_metrics.investment_memo),
              keyPoints: response.business_metrics.investment_memo.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => cleanText(line.replace(/^\d+\.\s*/, '')))
            }
          },
          riskFactors: response.risk_factor.investment_memo.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => cleanText(line.replace(/^\d+\.\s*/, ''))),
          nextSteps: response.recommended_next_steps.investment_memo.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => cleanText(line.replace(/^\d+\.\s*/, '')))
        };
        
        setAnalysisResults(transformedResults);
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Analysis failed:', error);
        setIsAnalyzing(false);
        alert('Analysis failed: ' + error.message);
      }
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

  // Show login screen first
  if (showLoginFirst) {
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
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mode Banner */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">{isAuthenticated ? '🚀' : '🎭'}</span>
              <span className="text-white text-sm">
                {isAuthenticated ? 'Live Mode - Real AI Analysis Active' : 'Demo Mode - Using sample data'}
              </span>
            </div>
            {!isAuthenticated && (
              <button
                onClick={() => setShowLoginFirst(true)}
                className="text-purple-300 hover:text-purple-200 text-sm underline"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Startup Analyst</h1>
                <p className="text-purple-200 text-sm">Powered by R S Dileepumar</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Success Metrics */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center metric-counter">
                  <div className="text-green-400 font-bold">90%</div>
                  <div className="text-purple-200 text-xs">Time Saved</div>
                </div>
                <div className="text-center metric-counter">
                  <div className="text-blue-400 font-bold">$1.2M</div>
                  <div className="text-purple-200 text-xs">Revenue Potential</div>
                </div>
                <div className="text-center metric-counter">
                  <div className="text-yellow-400 font-bold">50+</div>
                  <div className="text-purple-200 text-xs">VCs Ready</div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowDemoScript(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all enhanced-button"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Demo Script</span>
              </button>
              
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    setIsAuthenticated(false);
                    setDemoMode(false);
                    setShowLoginFirst(true);
                    setUploadedFiles([]);
                    setAnalysisResults(null);
                  }}
                  className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg transition-all border border-red-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-white px-4 py-2 rounded-lg transition-all border border-purple-500/30"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
              

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 mb-8">
          {[
            { id: 'upload', label: 'Data Input', icon: Upload },
            { id: 'analysis', label: 'AI Analysis', icon: TrendingUp },
            { id: 'memo', label: 'Investment Memo', icon: FileText },
            { id: 'integration', label: "Let's Venture", icon: Building2 },
            { id: 'preferences', label: 'Settings', icon: Settings }
          ].filter(tab => tab.id !== 'preferences').map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-600 shadow-lg' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
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
                    className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors bg-white/5"
                  >
                    <Upload className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload files</p>
                    <p className="text-purple-200 text-sm">PDF, PPT, DOC, TXT files supported</p>
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
                        <p className="text-red-400 mb-2">Recording... {formatTime(recordingTime)}</p>
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
            {isAnalyzing ? (
              <div className="space-y-8">
                {/* AI Progress Tracker */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">AI Agents Working...</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiSteps.map((step, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border-2 transition-all ${
                        idx === currentStep 
                          ? 'bg-purple-500/20 border-purple-400 scale-105' 
                          : idx < currentStep 
                          ? 'bg-green-500/20 border-green-400'
                          : 'bg-white/5 border-white/20'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl mb-2">{step.icon}</div>
                          <h4 className="text-white font-medium text-sm mb-1">{step.name}</h4>
                          <p className="text-xs text-purple-200">{step.description}</p>
                          {idx === currentStep && (
                            <div className="mt-2">
                              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full mx-auto"></div>
                            </div>
                          )}
                          {idx < currentStep && (
                            <div className="mt-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Metrics Dashboard */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">📊 Live Analysis Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">156</div>
                      <div className="text-sm text-purple-200">Startups Analyzed Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">15.2min</div>
                      <div className="text-sm text-purple-200">Avg Analysis Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">94%</div>
                      <div className="text-sm text-purple-200">Investor Satisfaction</div>
                    </div>
                  </div>
                </div>

                {/* Mock API Tracker */}
                {apiCalls.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">🌐 API Integrations</h4>
                    <div className="space-y-2">
                      {apiCalls.map((api, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white text-sm">{api.name}</span>
                            <span className="text-purple-300 text-xs">{api.endpoint}</span>
                          </div>
                          <span className="text-green-400 text-xs">✓ {api.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : analysisResults ? (
              <div className="space-y-8">
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-8 border border-white/20">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{analysisResults.companyInfo.companyName}</h2>
                    <p className="text-purple-200 mb-6">{analysisResults.companyInfo.sector} • {analysisResults.companyInfo.stage} • Founded {analysisResults.companyInfo.foundedYear}</p>
                    <div className="inline-flex items-center space-x-4 bg-white/10 rounded-full px-8 py-4">
                      <Star className="w-8 h-8 text-yellow-400" />
                      <div>
                        <div className="text-4xl font-bold text-white">{analysisResults.overallScore}</div>
                        <div className="text-purple-200">Investment Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Score Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatedScoreCard 
                    title="Founder Profile" 
                    finalScore={analysisResults.founderScore} 
                    icon={Users} 
                    color="#8B5CF6"
                    delay={200}
                  />
                  <AnimatedScoreCard 
                    title="Market Opportunity" 
                    finalScore={analysisResults.marketScore} 
                    icon={TrendingUp} 
                    color="#06B6D4"
                    delay={400}
                  />
                  <AnimatedScoreCard 
                    title="Differentiator" 
                    finalScore={analysisResults.differentiatorScore} 
                    icon={Lightbulb} 
                    color="#F59E0B"
                    delay={600}
                  />
                  <AnimatedScoreCard 
                    title="Business Metrics" 
                    finalScore={analysisResults.metricsScore} 
                    icon={DollarSign} 
                    color="#10B981"
                    delay={800}
                  />
                </div>

                {/* Risk Factors & Next Steps */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-500/10 backdrop-blur-md rounded-xl p-6 border border-red-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4">⚠️ Risk Factors</h3>
                    <ul className="space-y-2">
                      {analysisResults.riskFactors.map((risk, idx) => (
                        <li key={idx} className="text-red-200">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4">✅ Recommended Next Steps</h3>
                    <ul className="space-y-2">
                      {analysisResults.nextSteps.map((step, idx) => (
                        <li key={idx} className="text-green-200">• {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
                <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Analysis Available</h3>
                <p className="text-purple-200 mb-6">Upload startup materials and run analysis to see results here.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                >
                  Upload Materials
                </button>
              </div>
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
                  {Object.entries(analysisResults.investmentMemo).map(([section, data]) => (
                    <div key={section} className="bg-white/5 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white capitalize">
                          {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Score: {data.score}
                        </div>
                      </div>
                      <p className="text-purple-100 mb-4 leading-relaxed">{data.summary}</p>
                      <div className="space-y-2">
                        {data.keyPoints && data.keyPoints.length > 0 && (
                          <ul className="list-disc list-inside text-purple-200">
                            {data.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Memo Available</h3>
                <p className="text-purple-200 mb-6">Run an analysis to generate an investment memo.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                >
                  Upload Materials
                </button>
              </div>
            )}
          </div>
        )}



        {activeTab === 'integration' && (
          <LetsVentureIntegration />
        )}
      
        {/* Demo Script Modal */}
        {showDemoScript && (
          <DemoScript onClose={() => setShowDemoScript(false)} />
        )}
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
    );
  };
  
  export default StartupAIAnalyst;