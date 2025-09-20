/**
 * Document Data Extraction Utility
 * Extracts real data from PDF, PPTX, and DOCX documents
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

class DocumentExtractor {
  async extractFromDocument(file) {
    try {
      console.log('Processing file:', file.name, 'Type:', file.type);
      
      let text = '';
      const fileType = file.type || file.name.split('.').pop().toLowerCase();
      
      if (fileType.includes('pdf') || file.name.endsWith('.pdf')) {
        text = await this.extractTextFromPDF(file);
      } else if (fileType.includes('presentation') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        text = await this.extractTextFromPPTX(file);
      } else if (fileType.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        text = await this.extractTextFromDOCX(file);
      } else {
        console.warn('Unsupported file type:', fileType);
        return this.getFallbackData('Unsupported file format');
      }
      
      console.log('Extracted text length:', text.length);
      console.log('Sample text:', text.substring(0, 500));
      
      if (text.length < 50) {
        console.warn('Very little text extracted from', file.name);
        return this.getFallbackData(`Insufficient text extracted from ${file.name}`);
      }
      
      return this.parseExtractedText(text, file.name);
    } catch (error) {
      console.error('Document extraction failed:', error);
      return this.getFallbackData(`Extraction failed: ${error.message}`);
    }
  }

  async extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  }

  async extractTextFromPPTX(file) {
    // For PPTX files, we'll use a simple approach
    // In production, use libraries like pptx2json or similar
    const arrayBuffer = await file.arrayBuffer();
    const text = await this.extractTextFromZip(arrayBuffer);
    return text;
  }
  
  async extractTextFromDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  
  async extractTextFromZip(arrayBuffer) {
    // Simple text extraction from ZIP-based files (PPTX)
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = '';
    
    // Look for readable text patterns in the binary data
    for (let i = 0; i < uint8Array.length - 10; i++) {
      let word = '';
      for (let j = 0; j < 20; j++) {
        const char = String.fromCharCode(uint8Array[i + j]);
        if (char.match(/[a-zA-Z0-9]/)) {
          word += char;
        } else if (word.length > 3) {
          text += word + ' ';
          break;
        } else {
          word = '';
          break;
        }
      }
    }
    
    return text;
  }

  parseExtractedText(text, fileName = '') {
    return {
      founderInfo: this.extractFounderInfo(text),
      businessModel: this.extractBusinessModel(text),
      financials: this.extractFinancials(text),
      market: this.extractMarketInfo(text),
      product: this.extractProductInfo(text)
    };
  }

  extractFounderInfo(text) {
    const names = this.extractNames(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);

    return {
      names: names.length > 0 ? names : ['Founder information not found'],
      experience: experience.length > 0 ? experience : ['Experience not specified'],
      education: education.length > 0 ? education : ['Education not specified'],
      previousStartups: this.extractPreviousStartups(text)
    };
  }

  extractNames(text) {
    const namePatterns = [
      /(?:founder|ceo|cto|co-founder)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*-\s*(?:founder|ceo|cto))/gi
    ];

    const names = [];
    namePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const name = match.replace(/(?:founder|ceo|cto|co-founder)\s*:?\s*/gi, '').trim();
          if (name && name.length > 3 && !names.includes(name)) {
            names.push(name);
          }
        });
      }
    });

    return names.slice(0, 5);
  }

  extractExperience(text) {
    const experiencePatterns = [
      /(\d+)\s*years?\s+experience/gi,
      /experience\s*:?\s*([^.\n]+)/gi,
      /worked\s+at\s+([^.\n,]+)/gi
    ];

    const experience = [];
    experiencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const exp = match.trim();
          if (exp.length > 5 && !experience.includes(exp)) {
            experience.push(exp);
          }
        });
      }
    });

    return experience.slice(0, 5);
  }

  extractEducation(text) {
    const educationPatterns = [
      /(MIT|Stanford|Harvard|Berkeley|CMU|Caltech)/gi,
      /(?:degree|phd|mba|bs|ms)\s+(?:from\s+)?([A-Z][^.\n,]+)/gi
    ];

    const education = [];
    educationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!education.includes(match)) {
            education.push(match);
          }
        });
      }
    });

    return education.slice(0, 3);
  }

  extractPreviousStartups(text) {
    const startupPatterns = [
      /(?:founded|started)\s+(\d+)\s+(?:companies|startups)/gi,
      /serial\s+entrepreneur/gi
    ];

    let count = 0;
    startupPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/\d+/);
          if (numbers) {
            count = Math.max(count, parseInt(numbers[0]));
          } else {
            count = Math.max(count, 1);
          }
        });
      }
    });

    return count;
  }

  extractBusinessModel(text) {
    return {
      revenue: this.extractRevenueModel(text),
      customers: this.extractCustomerSegment(text),
      pricing: this.extractPricing(text),
      scalability: this.extractScalability(text)
    };
  }

  extractRevenueModel(text) {
    const revenuePatterns = [
      /(subscription|saas|freemium|advertising|commission)/gi,
      /revenue\s+model\s*:?\s*([^.\n]+)/gi
    ];

    const models = [];
    revenuePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        models.push(...matches);
      }
    });

    return models.length > 0 ? models[0] : 'Not specified';
  }

  extractCustomerSegment(text) {
    const customerPatterns = [
      /(b2b|b2c|enterprise|consumer)/gi,
      /target\s+market\s*:?\s*([^.\n]+)/gi
    ];

    const segments = [];
    customerPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        segments.push(...matches);
      }
    });

    return segments.length > 0 ? segments[0] : 'Not specified';
  }

  extractPricing(text) {
    const pricingPatterns = [
      /\$(\d+)\s*(?:per|\/)\s*(?:month|year|user)/gi,
      /pricing\s*:?\s*([^.\n]+)/gi
    ];

    const prices = [];
    pricingPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        prices.push(...matches);
      }
    });

    return prices.length > 0 ? prices[0] : 'Not specified';
  }

  extractScalability(text) {
    if (text.toLowerCase().includes('scalable')) {
      return 'high';
    } else if (text.toLowerCase().includes('growth')) {
      return 'medium';
    }
    return 'low';
  }

  extractFinancials(text) {
    return {
      revenue: this.extractRevenue(text),
      growth: this.extractGrowthRate(text),
      burn: this.extractBurnRate(text),
      runway: this.extractRunway(text)
    };
  }

  extractRevenue(text) {
    const revenuePatterns = [
      /revenue\s*:?\s*\$?(\d+(?:,\d{3})*)/gi,
      /\$(\d+(?:,\d{3})*)\s+revenue/gi
    ];

    let revenue = 0;
    revenuePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+(?:,\d{3})*)/);
          if (numbers) {
            revenue = Math.max(revenue, parseInt(numbers[1].replace(/,/g, '')));
          }
        });
      }
    });

    return revenue;
  }

  extractGrowthRate(text) {
    const growthPatterns = [
      /growth\s*:?\s*(\d+)\s*%/gi,
      /(\d+)\s*%\s+growth/gi
    ];

    let growth = 0;
    growthPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+)/);
          if (numbers) {
            growth = Math.max(growth, parseInt(numbers[1]) / 100);
          }
        });
      }
    });

    return growth;
  }

  extractBurnRate(text) {
    const burnPatterns = [
      /burn\s+rate\s*:?\s*\$?(\d+(?:,\d{3})*)/gi,
      /monthly\s+burn\s*:?\s*\$?(\d+(?:,\d{3})*)/gi
    ];

    let burn = 0;
    burnPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+(?:,\d{3})*)/);
          if (numbers) {
            burn = Math.max(burn, parseInt(numbers[1].replace(/,/g, '')));
          }
        });
      }
    });

    return burn;
  }

  extractRunway(text) {
    const runwayPatterns = [
      /runway\s*:?\s*(\d+)\s*months?/gi,
      /(\d+)\s*months?\s+runway/gi
    ];

    let runway = 0;
    runwayPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+)/);
          if (numbers) {
            runway = Math.max(runway, parseInt(numbers[1]));
          }
        });
      }
    });

    return runway;
  }

  extractMarketInfo(text) {
    return {
      tam: this.extractTAM(text),
      growth: this.extractMarketGrowth(text),
      competitors: this.extractCompetitors(text)
    };
  }

  extractTAM(text) {
    const tamPatterns = [
      /tam\s*:?\s*\$?(\d+(?:,\d{3})*)\s*(?:billion|million)?/gi,
      /market\s+size\s*:?\s*\$?(\d+(?:,\d{3})*)\s*(?:billion|million)?/gi
    ];

    let tam = 0;
    tamPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+(?:,\d{3})*)/);
          if (numbers) {
            let value = parseInt(numbers[1].replace(/,/g, ''));
            if (match.toLowerCase().includes('billion')) {
              value *= 1000000000;
            } else if (match.toLowerCase().includes('million')) {
              value *= 1000000;
            }
            tam = Math.max(tam, value);
          }
        });
      }
    });

    return tam;
  }

  extractMarketGrowth(text) {
    const growthPatterns = [
      /market\s+growth\s*:?\s*(\d+)\s*%/gi,
      /growing\s+at\s+(\d+)\s*%/gi
    ];

    let growth = 0;
    growthPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+)/);
          if (numbers) {
            growth = Math.max(growth, parseInt(numbers[1]) / 100);
          }
        });
      }
    });

    return growth;
  }

  extractCompetitors(text) {
    const competitorPatterns = [
      /competitors?\s*:?\s*([^.\n]+)/gi,
      /competing\s+with\s+([^.\n]+)/gi
    ];

    const competitors = [];
    competitorPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const comp = match.replace(/competitors?\s*:?\s*|competing\s+with\s+/gi, '').trim();
          if (comp.length > 2 && !competitors.includes(comp)) {
            competitors.push(comp);
          }
        });
      }
    });

    return competitors.slice(0, 3);
  }

  extractProductInfo(text) {
    return {
      stage: this.extractProductStage(text),
      users: this.extractUserCount(text),
      features: this.extractFeatures(text),
      technology: this.extractTechnology(text)
    };
  }

  extractProductStage(text) {
    if (text.toLowerCase().includes('mvp')) return 'MVP';
    if (text.toLowerCase().includes('prototype')) return 'Prototype';
    if (text.toLowerCase().includes('beta')) return 'Beta';
    if (text.toLowerCase().includes('launched')) return 'Launched';
    return 'Concept';
  }

  extractUserCount(text) {
    const userPatterns = [
      /(\d+(?:,\d{3})*)\s*users?/gi,
      /users?\s*:?\s*(\d+(?:,\d{3})*)/gi
    ];

    let users = 0;
    userPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/(\d+(?:,\d{3})*)/);
          if (numbers) {
            users = Math.max(users, parseInt(numbers[1].replace(/,/g, '')));
          }
        });
      }
    });

    return users;
  }

  extractFeatures(text) {
    const featureKeywords = ['AI', 'analytics', 'dashboard', 'mobile', 'cloud', 'API'];
    const features = [];
    
    featureKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        features.push(keyword);
      }
    });

    return features.slice(0, 5);
  }

  extractTechnology(text) {
    const techKeywords = ['React', 'Node.js', 'Python', 'AI', 'ML', 'Cloud', 'AWS'];
    const technologies = [];
    
    techKeywords.forEach(tech => {
      if (text.toLowerCase().includes(tech.toLowerCase())) {
        technologies.push(tech);
      }
    });

    return technologies.slice(0, 5);
  }

  getFallbackData(reason = 'Document parsing failed') {
    return {
      founderInfo: {
        names: [`${reason} - Unable to extract founder names`],
        experience: [`${reason} - Check document format`],
        education: [`${reason} - Education data not found`],
        previousStartups: 0
      },
      businessModel: {
        revenue: `${reason} - Revenue model not extracted`,
        customers: `${reason} - Customer segment not identified`,
        pricing: `${reason} - Pricing not found`,
        scalability: 'unknown'
      },
      financials: {
        revenue: 0,
        growth: 0,
        burn: 0,
        runway: 0
      },
      market: {
        tam: 0,
        growth: 0,
        competitors: []
      },
      product: {
        stage: 'unknown',
        users: 0,
        features: [],
        technology: []
      }
    };
  }
  
  getSampleData(fileName) {
    // Extract company name from filename
    const companyName = fileName.replace(/\.(pdf|pptx|docx|ppt|doc)$/i, '').replace(/[-_]/g, ' ');
    
    return {
      founderInfo: {
        names: [`Data extraction failed for ${companyName}`],
        experience: ['Unable to extract founder experience from document'],
        education: ['Education information not found in document'],
        previousStartups: 0
      },
      businessModel: {
        revenue: 'Business model not extracted - document may be image-based',
        customers: 'Customer segment not identified in document',
        pricing: 'Pricing information not found',
        scalability: 'unknown'
      },
      financials: {
        revenue: 0,
        growth: 0,
        burn: 0,
        runway: 0
      },
      market: {
        tam: 0,
        growth: 0,
        competitors: []
      },
      product: {
        stage: 'Information not extracted',
        users: 0,
        features: ['Document parsing failed - try text-based PDF'],
        technology: ['Technology stack not identified']
      }
    };
  }
}

export default DocumentExtractor;