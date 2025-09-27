import os
from dotenv import load_dotenv

from typing import Annotated
from pydantic import BaseModel

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

engine =  create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


UPLOAD_DIR = os.getenv("UPLOAD_DIR")
ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]


ALLOWED_EXTENSIONS = {".pdf", ".ppt", ".pptx"}
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/upload-files/")
def parse_uploaded_files(file: Annotated[UploadFile, File(description="A file read as UploadFile", )]):
    try:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Only PDF and PPT files are allowed")
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file extension")
        
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as myfile:
            myfile.write(file.file.read())
    
        return {"status": "Files uploaded successfully", "message": f"File name is: {file.filename}"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}


@app.post("/run-ai-analysis/")
def run_ai_analysis():
    try:
        # Placeholder for AI analysis logic
        return {"status": "AI analysis completed successfully", "message": "AI analysis results"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=7680, reload=True)