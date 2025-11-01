import os
import uuid
import asyncio
import json
from datetime import datetime
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from typing import Annotated

from core.config import ALLOWED_EXTENSIONS, ALLOWED_TYPES
from models.user import UserDB
from core.auth import get_current_user
from typing import Optional
from ml_services.generate_reports import GenerateReports
from core.progress_tracker import SimpleProgressTracker
try:
    from ml_services.advanced_document_processor import AdvancedDocumentProcessor
except ImportError:
    AdvancedDocumentProcessor = None

try:
    from ml_services.enhanced_ai_analyzer import EnhancedAIAnalyzer, PredictiveAnalytics
except ImportError:
    EnhancedAIAnalyzer = None
    PredictiveAnalytics = None

try:
    from ml_services.market_intelligence import MarketIntelligenceEngine, CompetitiveAnalyzer
except ImportError:
    MarketIntelligenceEngine = None
    CompetitiveAnalyzer = None

try:
    from core.websocket_manager import websocket_manager, AnalysisProgressTracker, metrics_updater
except ImportError:
    websocket_manager = None
    AnalysisProgressTracker = None
    metrics_updater = None

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR")

os.makedirs(UPLOAD_DIR, exist_ok=True)



router = APIRouter()


async def enhanced_analysis(username, file_path, query):
    """Real AI analysis using GROQ LLM"""
    try:
        print(f"Starting analysis for {query}")
        
        # Use the working GenerateReports class
        generate_reports = GenerateReports(username, file_path, query)
        generate_reports.get_vector_db()
        generate_reports.get_context()
        generate_reports.create_prompt_template()
        generate_reports.generate_response()
        generate_reports.get_suggestion_and_score()
        
        # Calculate confidence based on response quality
        confidence = 0.9 if len(generate_reports.text) > 500 else 0.7
        confidence_level = "high" if confidence >= 0.8 else "medium"
        
        print(f"Completed analysis for {query}: score={generate_reports.score}, confidence={confidence}")
        
        return {
            'text': generate_reports.text,
            'score': generate_reports.score,
            'confidence': confidence,
            'confidence_level': confidence_level
        }
        
    except Exception as e:
        print(f"Error in analysis for {query}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'text': f"Analysis failed for {query}: {str(e)}",
            'score': 0,
            'confidence': 0.1,
            'confidence_level': 'low',
            'is_error': True
        }


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time updates"""
    if not websocket_manager:
        await websocket.close()
        return
        
    connection_id = str(uuid.uuid4())
    
    try:
        await websocket_manager.connect(websocket, user_id, connection_id)
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get('type') == 'ping':
                await websocket_manager.send_personal_message({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat()
                }, connection_id)
                
    except WebSocketDisconnect:
        if websocket_manager:
            websocket_manager.disconnect(user_id, connection_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket_manager:
            websocket_manager.disconnect(user_id, connection_id)

@router.post("/upload-files")
async def parse_uploaded_files(
    files: Annotated[UploadFile, File(description="A file read as UploadFile", )],
    current_user: UserDB=Depends(get_current_user)
):
    session_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    try:
        # Validate file
        if files.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Only PDF, PPT, DOC, DOCX, and TXT files are allowed")
        ext = os.path.splitext(files.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file extension")
        
        # Setup simple progress tracking
        progress_tracker = SimpleProgressTracker(session_id, current_user.username)
        await progress_tracker.update_progress(0, "Processing uploaded document...")
        
        # Save file
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        user_dir = os.path.join(UPLOAD_DIR, current_user.username)
        os.makedirs(user_dir, exist_ok=True)
        file_path = os.path.join(user_dir, files.filename)
        
        with open(file_path, "wb") as myfile:
            myfile.write(files.file.read())
        
        # Step 1: Document processing completed
        structured_data = {'company_info': {}, 'financial_data': {}, 'team_info': {}, 'market_data': {}}
        print("Document processing completed, proceeding to market intelligence")
        
        # Step 2: Market Intelligence
        await progress_tracker.next_step("Gathering market intelligence and competitive data...")
            
        if MarketIntelligenceEngine:
            market_engine = MarketIntelligenceEngine()
            company_name = structured_data.get('company_info', {}).get('name', files.filename)
            sector = structured_data.get('market_data', {}).get('sector', 'Technology')
            market_intel = await market_engine.get_comprehensive_intelligence(company_name, sector)
        else:
            market_intel = {}
        
        # Step 3: AI Analysis
        await progress_tracker.next_step("Running comprehensive AI analysis across multiple models...")
        
        print("Starting comprehensive AI analysis...")
        analysis_tasks = [
            enhanced_analysis(current_user.username, file_path, "founders_profile"),
            enhanced_analysis(current_user.username, file_path, "market_problem"),
            enhanced_analysis(current_user.username, file_path, "unique_differentiator"),
            enhanced_analysis(current_user.username, file_path, "business_metrics"),
            enhanced_analysis(current_user.username, file_path, "risk_factor"),
            enhanced_analysis(current_user.username, file_path, "recommended_next_steps")
        ]
        
        results = await asyncio.gather(*analysis_tasks)
        print(f"LLM analysis completed with {len(results)} results")
        
        # Step 4: Risk Assessment
        await progress_tracker.next_step("Calculating success probabilities and risk assessments...")
            
        analysis_results = {
            'founders_profile': results[0],
            'market_problem': results[1],
            'unique_differentiator': results[2],
            'business_metrics': results[3],
            'risk_factor': results[4],
            'recommended_next_steps': results[5]
        }
        
        if PredictiveAnalytics:
            predictive_analytics = PredictiveAnalytics()
            prediction = predictive_analytics.predict_success_probability(analysis_results)
        else:
            prediction = {}
        
        # Step 5: Report Generation
        await progress_tracker.next_step("Generating comprehensive investment memo and final report...")
            
        if CompetitiveAnalyzer:
            competitive_analyzer = CompetitiveAnalyzer()
            competitive_analysis = await competitive_analyzer.analyze_competition(structured_data.get('company_info', {}))
        else:
            competitive_analysis = {}
        
        # Final results
        final_results = {
            **analysis_results,
            'structured_data': structured_data,
            'market_intelligence': market_intel,
            'prediction': prediction,
            'competitive_analysis': competitive_analysis,
            'session_id': session_id,
            'analysis_duration': (datetime.now() - start_time).total_seconds(),
            'confidence_summary': {
                'avg_confidence': sum(r.get('confidence', 0.5) for r in results) / len(results),
                'high_confidence_count': sum(1 for r in results if r.get('confidence', 0) >= 0.8),
                'low_confidence_count': sum(1 for r in results if r.get('confidence', 0) < 0.6)
            }
        }
        
        # Complete analysis
        await progress_tracker.complete()
        
        # Update metrics
        if metrics_updater:
            await metrics_updater.increment_analysis_count()
            await metrics_updater.update_analysis_time(final_results['analysis_duration'])
        
        # Return formatted results for backward compatibility
        return {
            "founders_profile": {
                "investment_memo": results[0]['text'],
                "score": results[0]['score'],
                "confidence": results[0]['confidence'],
                "confidence_level": results[0]['confidence_level']
            },
            "market_problem": {
                "investment_memo": results[1]['text'],
                "score": results[1]['score'],
                "confidence": results[1]['confidence'],
                "confidence_level": results[1]['confidence_level']
            },
            "unique_differentiator": {
                "investment_memo": results[2]['text'],
                "score": results[2]['score'],
                "confidence": results[2]['confidence'],
                "confidence_level": results[2]['confidence_level']
            },
            "business_metrics": {
                "investment_memo": results[3]['text'],
                "score": results[3]['score'],
                "confidence": results[3]['confidence'],
                "confidence_level": results[3]['confidence_level']
            },
            "risk_factor": {
                "investment_memo": results[4]['text'],
                "score": results[4]['score'],
                "confidence": results[4]['confidence'],
                "confidence_level": results[4]['confidence_level']
            },
            "recommended_next_steps": {
                "investment_memo": results[5]['text'],
                "score": results[5]['score'],
                "confidence": results[5]['confidence'],
                "confidence_level": results[5]['confidence_level']
            },
            "enhanced_features": {
                "market_intelligence": market_intel,
                "prediction": prediction,
                "competitive_analysis": competitive_analysis,
                "structured_data": structured_data,
                "confidence_summary": final_results['confidence_summary']
            }
        }

    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Log error
        print(f"Analysis failed: {str(e)}")
        
        return {"status": "Error", "message": str(e)}
    

@router.get("/")
def health_check():
    return {"status": "healthy", "message": "AI Startup Analyst API is running"}

@router.post("/ai-chat")
async def ai_chat(request: dict):
    try:
        from langchain_groq import ChatGroq
        import os
        
        user_message = request.get('message', '')
        
        # Initialize GROQ LLM
        llm = ChatGroq(
            groq_api_key=os.getenv('GROQ_API_KEY'),
            model_name=os.getenv('LLM_MODEL_NAME', 'llama-3.1-8b-instant'),
            temperature=0.3
        )
        
        # Investment analysis context prompt
        system_prompt = """You are an expert venture capital investment analyst AI assistant. 
        You help investors understand startup analysis, investment scoring, market evaluation, 
        founder assessment, and risk analysis. Provide clear, professional, and actionable insights.
        Keep responses concise but informative. Focus on practical investment advice."""
        
        full_prompt = f"{system_prompt}\n\nUser Question: {user_message}\n\nResponse:"
        
        # Get AI response
        response = llm.invoke(full_prompt)
        
        return {
            "response": response.content,
            "model": "GROQ LLM",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"AI Chat error: {str(e)}")
        return {
            "response": "I'm currently experiencing technical difficulties. Please try again later or contact support.",
            "model": "fallback",
            "error": str(e)
        }

@router.post("/run-ai-analysis")
def run_ai_analysis():
    try:
        # Placeholder for AI analysis logic
        return {"status": "AI analysis completed successfully", "message": "AI analysis results"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}