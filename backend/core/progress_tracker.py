import asyncio
import time
from datetime import datetime

class SimpleProgressTracker:
    def __init__(self, session_id, username):
        self.session_id = session_id
        self.username = username
        self.current_step = 0
        self.total_steps = 5
        self.start_time = time.time()
        
        self.steps = [
            {"name": "Document Processing", "message": "Extracting text from uploaded document..."},
            {"name": "Market Intelligence", "message": "Gathering market data and competitive analysis..."},
            {"name": "AI Analysis", "message": "Running multi-agent AI analysis..."},
            {"name": "Risk Assessment", "message": "Calculating investment risks and opportunities..."},
            {"name": "Report Generation", "message": "Generating comprehensive investment memo..."}
        ]
    
    async def update_progress(self, step_index, custom_message=None):
        """Update progress to specific step"""
        if step_index < len(self.steps):
            self.current_step = step_index
            step = self.steps[step_index]
            message = custom_message or step["message"]
            
            print(f"Progress Update: Step {step_index + 1}/{self.total_steps} - {step['name']}: {message}")
            
            # Simulate some processing time
            await asyncio.sleep(0.5)
    
    async def next_step(self, custom_message=None):
        """Move to next step"""
        if self.current_step < len(self.steps) - 1:
            self.current_step += 1
            await self.update_progress(self.current_step, custom_message)
    
    async def complete(self):
        """Mark analysis as complete"""
        elapsed_time = time.time() - self.start_time
        print(f"Analysis completed in {elapsed_time:.2f} seconds")
        return {"status": "completed", "duration": elapsed_time}