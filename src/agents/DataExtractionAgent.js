/**
 * Data Extraction Agent - Specialized for document and voice processing
 */

import DocumentExtractor from '../utils/PDFExtractor.js';

class DataExtractionAgent {
  constructor(type) {
    this.type = type;
    this.extractors = {
      document: this.extractFromDocument.bind(this),
      voice: this.extractFromVoice.bind(this),
      publicData: this.extractPublicData.bind(this)
    };
  }

  async process(data) {
    const extractor = this.extractors[this.type];
    if (!extractor) {
      throw new Error(`Unknown extraction type: ${this.type}`);
    }
    return await extractor(data);
  }

  // Document extraction
  async extractFromDocument(documents) {
    const extractedData = {
      founderInfo: [],
      businessModel: {},
      financials: {},
      market: {},
      product: {}
    };

    const documentExtractor = new DocumentExtractor();

    for (const doc of documents || []) {
      try {
        console.log('Extracting data from:', doc.name || 'document');
        
        // Real document extraction (PDF, PPTX, DOCX)
        const docData = await documentExtractor.extractFromDocument(doc);
        console.log('Extracted data from', doc.name, ':', docData);
        
        this.mergeData(extractedData, docData);
        
        // Small delay for UI feedback
        await this.simulateProcessing(500);
      } catch (error) {
        console.error('Document extraction failed:', error);
        // Fallback to basic parsing
        const docData = this.parseDocument(doc);
        this.mergeData(extractedData, docData);
      }
    }

    return extractedData;
  }

  // Voice extraction
  async extractFromVoice(voiceData) {
    if (!voiceData) return { sentiment: 'neutral', keyPoints: [] };

    await this.simulateProcessing(800);
    
    return {
      sentiment: this.analyzeSentiment(voiceData),
      keyPoints: this.extractKeyPoints(voiceData),
      confidence: this.calculateConfidence(voiceData),
      duration: voiceData.duration || 0
    };
  }

  // Public data extraction
  async extractPublicData(companyName) {
    if (!companyName) return { marketData: {}, competitors: [] };

    await this.simulateProcessing(1200);
    
    return {
      marketData: this.getMarketData(companyName),
      competitors: this.getCompetitors(companyName),
      news: this.getRecentNews(companyName),
      funding: this.getFundingHistory(companyName)
    };
  }

  // Helper methods
  parseDocument(doc) {
    // Fallback document parsing when PDF extraction fails
    console.log('Using fallback parsing for:', doc.name || 'document');
    return {
      founderInfo: this.extractFounderInfo(doc),
      businessModel: this.extractBusinessModel(doc),
      financials: this.extractFinancials(doc),
      market: this.extractMarketInfo(doc),
      product: this.extractProductInfo(doc)
    };
  }

  extractFounderInfo(doc) {
    // Fallback data when real extraction fails
    return {
      names: [`Founder from ${doc.name || 'document'}`],
      experience: ['Experience data not available - PDF extraction failed'],
      education: ['Education data not available - PDF extraction failed'],
      previousStartups: 0
    };
  }

  extractBusinessModel(doc) {
    // Fallback data when real extraction fails
    return {
      revenue: 'Business model not extracted - check PDF format',
      customers: 'Customer segment not identified',
      pricing: 'Pricing not found in document',
      scalability: 'unknown'
    };
  }

  extractFinancials(doc) {
    // Fallback data when real extraction fails
    return {
      revenue: 0,
      growth: 0,
      burn: 0,
      runway: 0
    };
  }

  extractMarketInfo(doc) {
    // Fallback data when real extraction fails
    return {
      tam: 0,
      sam: 0,
      som: 0,
      growth: 0
    };
  }

  extractProductInfo(doc) {
    // Fallback data when real extraction fails
    return {
      stage: 'unknown',
      users: 0,
      features: ['Product features not extracted'],
      technology: ['Technology stack not identified']
    };
  }

  analyzeSentiment(voiceData) {
    const sentiments = ['positive', 'neutral', 'confident', 'passionate'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  extractKeyPoints(voiceData) {
    return [
      'Strong market opportunity',
      'Experienced team',
      'Unique technology advantage',
      'Clear monetization strategy'
    ];
  }

  calculateConfidence(voiceData) {
    return Math.random() * 0.3 + 0.7; // 70-100%
  }

  getMarketData(companyName) {
    return {
      size: Math.random() * 10000000000,
      growth: Math.random() * 0.2 + 0.05,
      trends: ['AI adoption', 'Digital transformation']
    };
  }

  getCompetitors(companyName) {
    return [
      { name: 'Competitor A', funding: 50000000 },
      { name: 'Competitor B', funding: 25000000 }
    ];
  }

  getRecentNews(companyName) {
    return [
      'Industry growth accelerating',
      'New regulations favorable',
      'Major player acquisition'
    ];
  }

  getFundingHistory(companyName) {
    return {
      totalRaised: 2000000,
      lastRound: 'Seed',
      investors: ['VC Fund A', 'Angel Investor B']
    };
  }

  mergeData(target, source) {
    Object.keys(source).forEach(key => {
      if (Array.isArray(target[key])) {
        target[key] = [...target[key], ...source[key]];
      } else if (typeof target[key] === 'object') {
        target[key] = { ...target[key], ...source[key] };
      } else {
        target[key] = source[key];
      }
    });
  }

  async simulateProcessing(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export default DataExtractionAgent;