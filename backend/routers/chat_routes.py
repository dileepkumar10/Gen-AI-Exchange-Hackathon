from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from groq import Groq
from core.auth import get_current_user
from models.user import UserDB as User

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    confidence: float

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """
    Chat with AI assistant about analysis results
    """
    try:
        # Initialize GROQ client
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Build context-aware prompt
        system_prompt = """You are an AI investment analyst assistant. You help explain startup analysis results, 
        answer questions about investment scores, and provide insights about startup evaluations. 
        Be concise, professional, and focus on actionable insights."""
        
        # Add context if available
        context_info = ""
        if chat_message.context:
            context_info = f"""
            Current Analysis Context:
            - Overall Score: {chat_message.context.get('overallScore', 'N/A')}
            - Founder Score: {chat_message.context.get('founderScore', 'N/A')}
            - Market Score: {chat_message.context.get('marketScore', 'N/A')}
            - Differentiator Score: {chat_message.context.get('differentiatorScore', 'N/A')}
            - Business Metrics Score: {chat_message.context.get('metricsScore', 'N/A')}
            - Company: {chat_message.context.get('companyName', 'Unknown')}
            """
        
        user_prompt = f"{context_info}\n\nUser Question: {chat_message.message}"
        
        # Call GROQ API
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=500
        )
        
        response_text = chat_completion.choices[0].message.content
        
        return ChatResponse(
            response=response_text,
            confidence=0.85  # Mock confidence score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.get("/chat/suggestions")
async def get_chat_suggestions(current_user: User = Depends(get_current_user)):
    """
    Get suggested chat prompts
    """
    suggestions = [
        "Explain this score",
        "What are the main risks?", 
        "Should I invest?",
        "Compare to industry average",
        "What's the market opportunity?",
        "Tell me about the founders",
        "What are the next steps?",
        "How confident is this analysis?"
    ]
    
    return {"suggestions": suggestions}