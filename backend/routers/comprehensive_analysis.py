from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user
from models.user import UserDB
from ml_services.specialized_agents import AgentOrchestrator
import os
import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict
import asyncio
from pathlib import Path

router = APIRouter()
_agent_orchestrator = None

def get_agent_orchestrator():
    global _agent_orchestrator
    if _agent_orchestrator is None:
        _agent_orchestrator = AgentOrchestrator()
    return _agent_orchestrator

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

@router.post("/comprehensive-analysis")
async def run_comprehensive_analysis(
    files: List[UploadFile] = File(...),
    investor_preferences: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run comprehensive multi-agent startup analysis"""
    
    try:
        # Create analysis project
        project_id = str(uuid.uuid4())
        analysis_id = str(uuid.uuid4())
        
        # Parse investor preferences
        preferences = {}
        if investor_preferences:
            try:
                preferences = json.loads(investor_preferences)
            except json.JSONDecodeError:
                preferences = {}
        
        # Skip database operations for now to focus on agent analysis
        print(f"Starting analysis for user {current_user.username}")
        print(f"Project ID: {project_id}, Analysis ID: {analysis_id}")
        print(f"Preferences: {preferences}")
        
        # Run analysis directly (not in background for debugging)
        print(f"Running analysis directly...")
        
        results = await process_comprehensive_analysis(
            project_id,
            analysis_id,
            files,
            preferences,
            current_user.id,
            current_user.username
        )
        
        print(f"Analysis completed, returning results...")
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")

async def process_comprehensive_analysis(
    project_id: str,
    analysis_id: str,
    files: List[UploadFile],
    preferences: Dict,
    user_id: int,
    username: str
):
    """Simplified background task for comprehensive analysis"""
    
    start_time = datetime.now()
    
    try:
        print(f"\n=== STARTING COMPREHENSIVE ANALYSIS ===")
        print(f"Project ID: {project_id}")
        print(f"Analysis ID: {analysis_id}")
        print(f"User: {username}")
        print(f"Files: {len(files)}")
        print(f"Preferences: {preferences}")
        
        # Step 1: File Processing and Text Extraction
        print(f"\n--- Step 1: Document Processing ---")
        document_texts = []
        
        for file in files:
            # Save file
            user_dir = Path(UPLOAD_DIR) / username
            user_dir.mkdir(parents=True, exist_ok=True)
            file_path = user_dir / file.filename
            
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Extract text
            extracted_text = await extract_document_text(str(file_path))
            document_texts.append(extracted_text)
            print(f"Processed file: {file.filename} ({len(extracted_text)} chars)")
        
        # Combine all document texts
        combined_text = "\n\n".join(document_texts)
        print(f"Combined text length: {len(combined_text)} characters")
        
        # Step 2: Extract company name
        company_name = extract_company_name(combined_text)
        print(f"Detected company name: {company_name}")
        
        # Step 3: Multi-Agent Analysis - THE CORE FUNCTIONALITY
        print(f"\n--- Step 3: AI Agent Analysis ---")
        print(f"Running AgentOrchestrator.run_comprehensive_analysis...")
        
        # Run comprehensive agent analysis
        orchestrator = get_agent_orchestrator()
        agent_results = orchestrator.run_comprehensive_analysis(
            combined_text, 
            preferences
        )
        
        print(f"Agent analysis completed!")
        print(f"Overall score: {agent_results.get('overall_score', 'N/A')}")
        print(f"Agent results keys: {list(agent_results.keys())}")
        
        # Step 4: Compile final results
        print(f"\n--- Step 4: Compiling Results ---")
        
        # Get category scores from agent results
        agent_data = agent_results.get('agent_results', {})
        category_scores = {
            'founder': agent_data.get('founder', {}).get('score', 60),
            'market': agent_data.get('market', {}).get('score', 60),
            'traction': agent_data.get('traction', {}).get('score', 60),
            'finance': agent_data.get('finance', {}).get('score', 60),
            'risk': agent_data.get('risk', {}).get('score', 60)
        }
        
        print(f"Category scores: {category_scores}")
        
        # Calculate success probability
        overall_score = agent_results.get('overall_score', 60)
        success_probability = min(0.95, max(0.05, overall_score / 100))
        
        final_results = {
            "analysis_id": analysis_id,
            "project_id": project_id,
            "company_name": company_name,
            "overall_score": overall_score,
            "confidence": agent_results.get('overall_confidence', 0.8),
            "investment_recommendation": agent_results.get('investment_recommendation', {
                'recommendation': 'Consider',
                'rationale': 'Analysis completed with AI insights'
            }),
            "category_scores": category_scores,
            "agent_results": agent_data,
            "success_prediction": {
                "success_probability": success_probability,
                "success_percentage": f"{round(success_probability * 100, 1)}%",
                "success_category": "High" if success_probability >= 0.7 else "Moderate" if success_probability >= 0.5 else "Low"
            },
            "key_insights": agent_results.get('key_insights', []),
            "next_steps": agent_results.get('next_steps', []),
            "analysis_metadata": {
                "processing_time": (datetime.now() - start_time).total_seconds(),
                "files_processed": len(files),
                "text_length": len(combined_text),
                "timestamp": datetime.now().isoformat(),
                "ai_model": "GROQ llama-3.1-8b-instant",
                "agents_run": list(agent_data.keys())
            }
        }
        
        print(f"\n=== ANALYSIS COMPLETE ===")
        print(f"Overall Score: {overall_score}")
        print(f"Processing Time: {(datetime.now() - start_time).total_seconds():.2f}s")
        print(f"Success Probability: {success_probability:.1%}")
        
        return final_results
        
    except Exception as e:
        print(f"\n❌ ANALYSIS FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return error result
        return {
            "analysis_id": analysis_id,
            "project_id": project_id,
            "error": str(e),
            "status": "failed",
            "processing_time": (datetime.now() - start_time).total_seconds()
        }

async def extract_document_text(file_path: str) -> str:
    """Extract text from various document formats"""
    
    file_ext = Path(file_path).suffix.lower()
    
    try:
        if file_ext == '.pdf':
            import PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        
        elif file_ext in ['.doc', '.docx']:
            try:
                import docx2txt
                return docx2txt.process(file_path)
            except ImportError:
                from docx import Document
                doc = Document(file_path)
                return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        
        elif file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        
        else:
            return f"Unsupported file format: {file_ext}"
            
    except Exception as e:
        return f"Error extracting text from {file_path}: {str(e)}"

def extract_company_name(text: str) -> str:
    """Extract company name from document text"""
    
    # Simple heuristics to find company name
    lines = text.split('\n')[:10]  # Check first 10 lines
    
    for line in lines:
        line = line.strip()
        if len(line) > 3 and len(line) < 50:
            # Skip common headers
            if not any(skip in line.lower() for skip in ['pitch', 'deck', 'presentation', 'confidential']):
                # Look for company-like patterns
                if any(indicator in line.lower() for indicator in ['inc', 'llc', 'corp', 'ltd', 'technologies', 'systems']):
                    return line
                # Or just take the first substantial line
                elif len(line.split()) <= 4 and line[0].isupper():
                    return line
    
    return "Unknown Company"

def extract_financial_metrics(text: str) -> Dict[str, float]:
    """Extract financial metrics from document text"""
    
    import re
    
    metrics = {}
    
    # Revenue patterns
    arr_pattern = r'ARR.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?'
    mrr_pattern = r'MRR.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?'
    revenue_pattern = r'revenue.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?'
    
    # Growth patterns
    growth_pattern = r'(?:growth|growing).*?(\d+(?:\.\d+)?)%'
    
    # Customer patterns
    customer_pattern = r'(?:customers?|users?).*?(\d+(?:,\d+)*)'
    
    # Financial patterns
    burn_pattern = r'burn.*?[\$]?(\d+(?:\.\d+)?)\s*(?:million|thousand|M|K)?'
    runway_pattern = r'runway.*?(\d+(?:\.\d+)?)\s*(?:months?|years?)'
    cac_pattern = r'CAC.*?[\$]?(\d+(?:\.\d+)?)'
    ltv_pattern = r'LTV.*?[\$]?(\d+(?:\.\d+)?)'
    
    patterns = {
        'arr': arr_pattern,
        'mrr': mrr_pattern,
        'revenue': revenue_pattern,
        'growth_rate': growth_pattern,
        'customers': customer_pattern,
        'monthly_burn': burn_pattern,
        'runway': runway_pattern,
        'cac': cac_pattern,
        'ltv': ltv_pattern
    }
    
    for metric, pattern in patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            try:
                value = float(re.sub(r'[^\d.]', '', matches[0]))
                metrics[metric] = value
            except (ValueError, IndexError):
                continue
    
    return metrics

# Simplified helper functions for basic analysis

@router.post("/investor-preferences")
async def save_investor_preferences(
    preferences: Dict,
    current_user: UserDB = Depends(get_current_user)
):
    """Save investor preferences (simplified)"""
    print(f"Saving preferences for user {current_user.username}: {preferences}")
    return {"message": "Investor preferences saved successfully"}

@router.get("/investor-preferences")
async def get_investor_preferences(
    current_user: UserDB = Depends(get_current_user)
):
    """Get investor preferences (simplified)"""
    return {
        "founder_weight": 25.0,
        "market_weight": 25.0,
        "product_weight": 20.0,
        "traction_weight": 15.0,
        "finance_weight": 10.0,
        "risk_weight": 5.0,
        "risk_tolerance": "medium",
        "min_overall_score": 70.0
    }