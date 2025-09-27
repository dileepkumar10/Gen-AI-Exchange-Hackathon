import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from typing import Annotated

from core.config import ALLOWED_EXTENSIONS, ALLOWED_TYPES
from models.user import UserDB
from core.auth import get_current_user
from ml_services.generate_reports import GenerateReports

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR")

os.makedirs(UPLOAD_DIR, exist_ok=True)



router = APIRouter()


def call_again(username, file_path, query):
    try:
        generate_reports = GenerateReports(username, file_path, query)
        generate_reports.get_vector_db()
        generate_reports.get_context()
        generate_reports.create_prompt_template()
        generate_reports.generate_response()
        generate_reports.get_suggestion_and_score()
        return generate_reports.text, generate_reports.score
    except Exception as e:
        print(f"Error in call_again for {query}: {str(e)}")
        return f"Error analyzing {query}: {str(e)}", 0


@router.post("/upload-files")
def parse_uploaded_files(
    files: Annotated[UploadFile, File(description="A file read as UploadFile", )],
    current_user: UserDB=Depends(get_current_user)
):
    try:
        if files.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Only PDF and PPT files are allowed")
        ext = os.path.splitext(files.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file extension")
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        user_dir = os.path.join(UPLOAD_DIR, current_user.username)
        os.makedirs(user_dir, exist_ok=True)
        file_path = os.path.join(user_dir, files.filename)
        with open(file_path, "wb") as myfile:
            myfile.write(files.file.read())
        
        # Process each analysis section
        print(f"Starting analysis for file: {file_path}")
        
        founders_profile = call_again(current_user.username, file_path, "founders_profile")
        print(f"Founders profile completed: {founders_profile}")
        
        market_problem = call_again(current_user.username, file_path, "market_problem")
        print(f"Market problem completed: {market_problem}")
        
        unique_differentiator = call_again(current_user.username, file_path, "unique_differentiator")
        print(f"Unique differentiator completed: {unique_differentiator}")
        
        business_metrics = call_again(current_user.username, file_path, "business_metrics")
        print(f"Business metrics completed: {business_metrics}")
        
        risk_factor = call_again(current_user.username, file_path, "risk_factor")
        print(f"Risk factor completed: {risk_factor}")
        
        recommended_next_steps = call_again(current_user.username, file_path, "recommended_next_steps")
        print(f"Recommended next steps completed: {recommended_next_steps}")

        return {
                "founders_profile": {
                    "investment_memo": founders_profile[0],
                    "score": founders_profile[1],
                },
                "market_problem": {
                    "investment_memo": market_problem[0],
                    "score": market_problem[1],
                },
                "unique_differentiator": {
                    "investment_memo": unique_differentiator[0],
                    "score": unique_differentiator[1],
                },
                "business_metrics": {
                    "investment_memo": business_metrics[0],
                    "score": business_metrics[1],
                },
                "risk_factor": {
                    "investment_memo": risk_factor[0],
                    "score": risk_factor[1],
                },
                "recommended_next_steps": {
                    "investment_memo": recommended_next_steps[0],
                    "score": recommended_next_steps[1],
                },
        }

    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "Error", "message": str(e)}
    

@router.post("/run-ai-analysis")
def run_ai_analysis():
    try:
        # Placeholder for AI analysis logic
        return {"status": "AI analysis completed successfully", "message": "AI analysis results"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}
