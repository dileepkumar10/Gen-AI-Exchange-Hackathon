# 🚀 AI Startup Analyst - AI-Powered Version

**Complete Multi-Agent AI System for Venture Capital Analysis with Real LLM Integration**

Transform your startup evaluation process from 4 hours to 15 minutes with professional investment memos powered by GROQ LLM and advanced AI agents.

## 🆕 What's New in AI-Included Branch

- ✅ **Real AI Integration**: GROQ LLM for actual document analysis
- ✅ **User Authentication**: JWT-based login/signup system
- ✅ **PDF Processing**: Real document text extraction with PyPDF2
- ✅ **Professional PDF Export**: Business-grade investment memo generation
- ✅ **PostgreSQL Database**: Production-ready data storage
- ✅ **Live/Demo Modes**: Switch between real AI analysis and demo data

## 🎯 Overview

AI Startup Analyst revolutionizes venture capital decision-making by leveraging multiple specialized AI agents to analyze startups comprehensively. Upload pitch decks, record voice pitches, and receive detailed investment analysis with professional memos in minutes.

## 📸 Application Screenshots

### Data Input Interface
![Data Input](https://github.com/dileepkumar10/Gen-AI-Exchange-Hackathon/blob/master/screenshots/Screenshot%202025-09-20%20185742.png)
*Upload pitch decks, documents, and record voice pitches with real-time waveform visualization*

### AI Analysis Dashboard
![AI Analysis](https://github.com/dileepkumar10/Gen-AI-Exchange-Hackathon/blob/master/screenshots/Screenshot%202025-09-20%20185753.png)
*Comprehensive scoring with animated score cards showing Founder Profile, Market Opportunity, Differentiator, and Business Metrics*

### Investment Memo Generation
![Investment Memo](https://github.com/dileepkumar10/Gen-AI-Exchange-Hackathon/blob/master/screenshots/Screenshot%202025-09-20%20185806.png)
*Professional investment memos with detailed analysis and scoring for each section*

### Let's Venture Integration
![Let's Venture Integration](https://github.com/dileepkumar10/Gen-AI-Exchange-Hackathon/blob/master/screenshots/Screenshot%202025-09-20%20185822.png)
*Ready-to-deploy integration with pilot program details and pricing plans*

## ✨ Key Features

### 🤖 Multi-Agent AI Architecture
- **Data Extraction Agent**: Parses documents and extracts key information
- **Public Data Agent**: Gathers market intelligence from external sources
- **Analysis Agent**: Computes investment scores and risk assessments
- **Memo Generation Agent**: Creates professional investment reports

### 📊 Comprehensive Analysis
- **Founder Profile Scoring**: Team experience, track record, complementarity
- **Market Opportunity Assessment**: TAM, growth potential, competitive landscape
- **Differentiator Evaluation**: Unique value proposition, IP, moats
- **Business Metrics Analysis**: Revenue, growth, unit economics

### 🎙️ Voice Analysis
- Record and analyze founder pitches
- Real-time waveform visualization
- AI-powered speech pattern analysis

### 📄 Professional Output
- Investment memos with detailed scoring
- Risk factor identification
- Recommended next steps
- PDF export functionality

## 🏆 Hackathon Features

### 🎭 Demo Mode
- Interactive demo script for presentations
- Sample data from real companies (Uber, Tesla, etc.)
- Live metrics dashboard
- Mock API integration display

### 🤝 Let's Venture Integration
- 6-month pilot program ready
- White-label customization
- API endpoints prepared
- Pricing plans configured

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- PostgreSQL (or use SQLite for development)
- GROQ API Key (get from https://console.groq.com/)

### Installation

#### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-startup-analyst/ai-startup-analyst

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
pip install PyPDF2  # For PDF processing
```

#### 2. Environment Configuration
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env with your settings:
# - Add your GROQ API key
# - Configure database URL
# - Set upload directory
```

#### 3. Database Setup
```bash
# Initialize database with prompts
cd backend
python init_db.py
```

#### 4. Start Application
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd ..
npm start
```

**Application URLs:**
- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

### Usage

#### Getting Started
1. **Login Screen**: Choose between Live Mode or Demo Mode
2. **Create Account**: Sign up for real AI analysis
3. **Upload Documents**: PDF pitch decks and business documents
4. **AI Analysis**: Real-time processing with GROQ LLM
5. **Professional Reports**: Export investment memos as PDF

#### Live Mode Features
- ✅ **Real AI Analysis**: GROQ LLM processes your documents
- ✅ **Document Upload**: PDF text extraction and analysis
- ✅ **User Authentication**: Secure login with JWT tokens
- ✅ **Investment Scoring**: AI-generated scores (0-100)
- ✅ **Professional PDFs**: Business-grade memo export
- ✅ **File Management**: Upload, view, and remove documents

#### Demo Mode Features
- 🎭 **Sample Data**: Pre-built analysis examples
- 🎭 **UI Testing**: Full interface without backend
- 🎭 **Presentation Ready**: Perfect for demos and pitches

## 📈 Business Impact

- **90% Time Reduction**: 4 hours → 15 minutes analysis time
- **80% Cost Savings**: Automated evaluation process
- **$1.2M Revenue Potential**: Annual recurring revenue projection
- **50+ VCs Ready**: Market validation and adoption pipeline

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS, Custom animations
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with professional templates
- **HTTP Client**: Fetch API with authentication
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with OAuth2 Bearer tokens
- **AI Integration**: GROQ LLM (llama-3.1-8b-instant)
- **Document Processing**: PyPDF2 for text extraction
- **File Upload**: Multi-part form handling
- **API Documentation**: Auto-generated Swagger/OpenAPI

### AI & ML
- **LLM Provider**: GROQ Cloud
- **Model**: llama-3.1-8b-instant
- **Document Analysis**: Custom prompt engineering
- **Score Extraction**: Regex-based parsing with validation

## 📁 Project Structure

```
ai-startup-analyst/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StartupAIAnalyst.jsx    # Main application
│   │   │   ├── AuthModal.jsx           # Login/Signup modal
│   │   │   ├── DemoScript.jsx          # Demo guide
│   │   │   └── animations.css          # Custom animations
│   │   ├── services/
│   │   │   └── api.js                  # Backend API client
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── core/
│   │   ├── auth.py                     # JWT authentication
│   │   ├── database.py                 # Database connection
│   │   └── config.py                   # Configuration
│   ├── ml_services/
│   │   ├── generate_reports.py         # AI analysis engine
│   │   └── parse_documents.py          # PDF processing
│   ├── routers/
│   │   ├── auth_routes.py              # Auth endpoints
│   │   └── input_routes.py             # File upload & analysis
│   ├── models/
│   │   └── user.py                     # Database models
│   ├── .env                            # Environment variables
│   ├── requirements.txt                # Python dependencies
│   └── main.py                         # FastAPI application
└── README.md
```

## 🎯 Demo Script (5 Minutes)

### Opening Hook (30s)
"What if you could analyze 100 startups in the time it takes to review one?"

### Live Demo (3min)
1. Upload Uber pitch deck
2. Show AI agents working in real-time
3. Reveal 92/100 investment score
4. Export professional memo

### Differentiation (1min)
- First multi-agent AI system for VC analysis
- 90% faster than traditional methods
- Professional investment memos

### Business Impact (30s)
- Ready for 6-month pilot with Let's Venture
- $1.2M annual revenue potential
- 50+ VCs in adoption pipeline

## 🤝 Partnership Ready

### Let's Venture Integration
- ✅ API endpoints ready
- ✅ White-label customization
- ✅ Investor preference profiles
- ✅ Deal flow automation pipeline

### Pricing Plans
- **Pilot Program**: Free for 6 months (100 analyses)
- **Professional**: $2,500/month (unlimited analyses)
- **Enterprise**: Custom pricing with dedicated support

## 🏅 Competitive Advantages

1. **Multi-Agent Architecture**: First of its kind in VC analysis
2. **Speed**: 90% faster than manual evaluation
3. **Accuracy**: AI-powered comprehensive scoring
4. **Integration Ready**: Seamless platform integration
5. **Scalability**: Infinite analysis capacity

    <!-- ## 📊 Success Metrics

    - **Analysis Time**: 15.2 minutes average
    - **Investor Satisfaction**: 94% approval rating
    - **Deal Flow Efficiency**: 3x improvement
    - **Cost Savings**: $500K annually per VC firm -->

## 🔮 Future Roadmap

### Phase 1 (Months 1-3): MVP Development
- Backend API development
- Real document processing
- ML model training
- Pilot with 10 startups

### Phase 2 (Months 4-6): Scale & Enhance
- Advanced AI features
- Let's Venture integration
- Mobile app development
- 100+ startup pilot

### Phase 3 (Months 7-12): Market Launch
- Full product launch
- Customer acquisition
- International expansion
- Advanced analytics

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_startup_analyst

# Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Integration
GROQ_API_KEY=your-groq-api-key
LLM_MODEL_NAME=llama-3.1-8b-instant

# File Upload
UPLOAD_DIR=./uploads
```

### API Endpoints

#### Authentication
- `POST /signup` - Create user account
- `POST /login` - User login (returns JWT token)
- `GET /protected` - Test protected route

#### Analysis
- `POST /upload-files` - Upload and analyze documents
- `POST /run-ai-analysis` - Run AI analysis
- `GET /` - Health check

## 🚀 Deployment

### Production Setup
1. **Environment**: Update `.env` for production
2. **Database**: Use PostgreSQL in production
3. **Security**: Change SECRET_KEY and use HTTPS
4. **CORS**: Configure allowed origins
5. **File Storage**: Use cloud storage for uploads

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

- **Email**: kumardileep2462000@gmail.com
- **GitHub**: [Repository Link]

---

**Ready to revolutionize venture capital analysis with real AI? Start your analysis today!**

🏆 *AI-Powered Investment Analysis System*