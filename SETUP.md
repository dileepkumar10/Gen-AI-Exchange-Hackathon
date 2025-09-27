# AI Startup Analyst - Setup Guide

## Quick Start

### 1. Automated Setup (Recommended)
```bash
# Run the setup script to install all dependencies
setup.bat

# Start both frontend and backend servers
start-app.bat
```

### 2. Manual Setup

#### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

#### Frontend Setup
```bash
# Install Node.js dependencies
npm install

# Start the development server
npm start
```

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:7680
- **API Documentation**: http://127.0.0.1:7680/docs

## Features

### Demo Mode
- Works without backend connection
- Uses sample data for demonstration
- Perfect for presentations and testing UI

### Live Mode (Requires Authentication)
- Full backend integration
- Real file upload and processing
- User authentication and session management
- AI-powered analysis with ML services

## API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - User login
- `GET /protected` - Test protected route

### File Operations
- `POST /upload-files` - Upload pitch decks and documents
- `POST /run-ai-analysis` - Execute AI analysis on uploaded files

### Health Check
- `GET /` - Backend health check

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./startup_analyst.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=./uploads
```

## Troubleshooting

### Backend Connection Issues
1. Ensure Python dependencies are installed: `pip install -r requirements.txt`
2. Check if port 7680 is available
3. Verify `.env` file exists in backend directory
4. Check backend logs for errors

### Frontend Issues
1. Ensure Node.js dependencies are installed: `npm install`
2. Check if port 3000 is available
3. Clear browser cache and reload

### Authentication Issues
1. Create a new account using the signup form
2. Check backend logs for authentication errors
3. Ensure SECRET_KEY is set in `.env` file

## Development

### Adding New Features
1. Backend: Add routes in `backend/routers/`
2. Frontend: Add API calls in `src/services/api.js`
3. Update UI components in `src/components/`

### Database
- SQLite database is created automatically
- User data is stored locally in `startup_analyst.db`

## Production Deployment

1. Update environment variables for production
2. Use a production-grade database (PostgreSQL recommended)
3. Configure proper CORS settings
4. Set up SSL/HTTPS
5. Use production WSGI server (gunicorn) for backend
6. Build and serve frontend with nginx or similar

## Support

For issues and questions:
- Check the troubleshooting section above
- Review backend logs in the terminal
- Ensure all dependencies are properly installed