import json
import asyncio
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> set of connection_ids
        self.analysis_sessions: Dict[str, Dict] = {}  # session_id -> session_data
    
    async def connect(self, websocket: WebSocket, user_id: str, connection_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        
        self.active_connections[connection_id] = websocket
        
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(connection_id)
        
        logger.info(f"WebSocket connected: user={user_id}, connection={connection_id}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Real-time connection established",
            "timestamp": datetime.now().isoformat(),
            "connection_id": connection_id
        }, connection_id)
    
    def disconnect(self, user_id: str, connection_id: str):
        """Disconnect a WebSocket client"""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(connection_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"WebSocket disconnected: user={user_id}, connection={connection_id}")
    
    async def send_personal_message(self, message: dict, connection_id: str):
        """Send message to specific connection"""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                # Remove broken connection
                if connection_id in self.active_connections:
                    del self.active_connections[connection_id]
    
    async def send_user_message(self, user_id: str, message: dict):
        """Send message to all connections of a user"""
        if user_id in self.user_connections:
            connection_ids = list(self.user_connections[user_id])
            for connection_id in connection_ids:
                await self.send_personal_message(message, connection_id)
    
    async def broadcast_message(self, message: dict):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
        
        connection_ids = list(self.active_connections.keys())
        for connection_id in connection_ids:
            await self.send_personal_message(message, connection_id)
    
    async def start_analysis_session(self, user_id: str, session_id: str, analysis_data: dict):
        """Start a new analysis session with real-time updates"""
        self.analysis_sessions[session_id] = {
            "user_id": user_id,
            "start_time": datetime.now(),
            "status": "started",
            "current_step": 0,
            "total_steps": 5,
            "data": analysis_data
        }
        
        await self.send_user_message(user_id, {
            "type": "analysis_started",
            "session_id": session_id,
            "message": "AI analysis started",
            "timestamp": datetime.now().isoformat(),
            "total_steps": 5
        })
    
    async def update_analysis_progress(self, session_id: str, step: int, step_name: str, message: str, confidence: float = None):
        """Update analysis progress for a session"""
        if session_id not in self.analysis_sessions:
            return
        
        session = self.analysis_sessions[session_id]
        session["current_step"] = step
        session["last_update"] = datetime.now()
        
        user_id = session["user_id"]
        
        progress_message = {
            "type": "analysis_progress",
            "session_id": session_id,
            "step": step,
            "step_name": step_name,
            "message": message,
            "progress_percentage": (step / session["total_steps"]) * 100,
            "timestamp": datetime.now().isoformat()
        }
        
        if confidence is not None:
            progress_message["confidence"] = confidence
        
        await self.send_user_message(user_id, progress_message)
    
    async def complete_analysis_session(self, session_id: str, results: dict):
        """Complete an analysis session"""
        if session_id not in self.analysis_sessions:
            return
        
        session = self.analysis_sessions[session_id]
        session["status"] = "completed"
        session["end_time"] = datetime.now()
        session["results"] = results
        
        user_id = session["user_id"]
        
        await self.send_user_message(user_id, {
            "type": "analysis_completed",
            "session_id": session_id,
            "message": "Analysis completed successfully",
            "results": results,
            "duration": (session["end_time"] - session["start_time"]).total_seconds(),
            "timestamp": datetime.now().isoformat()
        })
        
        # Clean up session after 1 hour
        asyncio.create_task(self.cleanup_session(session_id, delay=3600))
    
    async def send_error(self, session_id: str, error_message: str, error_type: str = "analysis_error"):
        """Send error message for a session"""
        if session_id not in self.analysis_sessions:
            return
        
        session = self.analysis_sessions[session_id]
        session["status"] = "error"
        session["error"] = error_message
        
        user_id = session["user_id"]
        
        await self.send_user_message(user_id, {
            "type": error_type,
            "session_id": session_id,
            "message": error_message,
            "timestamp": datetime.now().isoformat()
        })
    
    async def send_live_metrics(self, metrics: dict):
        """Send live metrics to all connected clients"""
        await self.broadcast_message({
            "type": "live_metrics",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        })
    
    async def send_market_update(self, market_data: dict, affected_sectors: List[str] = None):
        """Send market intelligence updates"""
        message = {
            "type": "market_update",
            "data": market_data,
            "timestamp": datetime.now().isoformat()
        }
        
        if affected_sectors:
            message["affected_sectors"] = affected_sectors
        
        await self.broadcast_message(message)
    
    async def send_notification(self, user_id: str, notification: dict):
        """Send notification to specific user"""
        await self.send_user_message(user_id, {
            "type": "notification",
            "notification": notification,
            "timestamp": datetime.now().isoformat()
        })
    
    async def cleanup_session(self, session_id: str, delay: int = 0):
        """Clean up analysis session after delay"""
        if delay > 0:
            await asyncio.sleep(delay)
        
        if session_id in self.analysis_sessions:
            del self.analysis_sessions[session_id]
            logger.info(f"Cleaned up analysis session: {session_id}")
    
    def get_active_users(self) -> List[str]:
        """Get list of active user IDs"""
        return list(self.user_connections.keys())
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)
    
    def get_user_connection_count(self, user_id: str) -> int:
        """Get number of connections for a specific user"""
        return len(self.user_connections.get(user_id, set()))

# Global WebSocket manager instance
websocket_manager = WebSocketManager()

class AnalysisProgressTracker:
    """Helper class to track and broadcast analysis progress"""
    
    def __init__(self, session_id: str, user_id: str, websocket_manager: WebSocketManager):
        self.session_id = session_id
        self.user_id = user_id
        self.ws_manager = websocket_manager
        self.current_step = 0
        self.steps = [
            {"name": "Document Processing", "message": "Extracting and processing documents..."},
            {"name": "Market Intelligence", "message": "Gathering market data and intelligence..."},
            {"name": "AI Analysis", "message": "Running multi-model AI analysis..."},
            {"name": "Predictive Analytics", "message": "Calculating success probabilities..."},
            {"name": "Report Generation", "message": "Generating investment memo..."}
        ]
    
    async def start(self, analysis_data: dict):
        """Start progress tracking"""
        await self.ws_manager.start_analysis_session(
            self.user_id, 
            self.session_id, 
            analysis_data
        )
    
    async def next_step(self, confidence: float = None, custom_message: str = None):
        """Move to next step"""
        if self.current_step < len(self.steps):
            step_info = self.steps[self.current_step]
            message = custom_message or step_info["message"]
            
            await self.ws_manager.update_analysis_progress(
                self.session_id,
                self.current_step + 1,
                step_info["name"],
                message,
                confidence
            )
            
            self.current_step += 1
    
    async def complete(self, results: dict):
        """Complete progress tracking"""
        await self.ws_manager.complete_analysis_session(self.session_id, results)
    
    async def error(self, error_message: str):
        """Report error"""
        await self.ws_manager.send_error(self.session_id, error_message)

class LiveMetricsUpdater:
    """Helper class to update live metrics"""
    
    def __init__(self, websocket_manager: WebSocketManager):
        self.ws_manager = websocket_manager
        self.metrics = {
            "analyses_today": 0,
            "avg_analysis_time": 15.2,
            "success_rate": 78.5,
            "user_satisfaction": 94.2,
            "active_users": 0
        }
    
    async def start_periodic_updates(self, interval: int = 30):
        """Start periodic metrics updates"""
        while True:
            await asyncio.sleep(interval)
            await self.update_metrics()
    
    async def update_metrics(self):
        """Update and broadcast current metrics"""
        # Update active users count
        self.metrics["active_users"] = len(self.ws_manager.get_active_users())
        
        # Simulate other metric updates (replace with real data)
        import random
        self.metrics["analyses_today"] += random.randint(0, 2)
        self.metrics["avg_analysis_time"] += random.uniform(-0.5, 0.5)
        self.metrics["success_rate"] += random.uniform(-1, 1)
        self.metrics["user_satisfaction"] += random.uniform(-0.5, 0.5)
        
        # Clamp values to reasonable ranges
        self.metrics["avg_analysis_time"] = max(10, min(30, self.metrics["avg_analysis_time"]))
        self.metrics["success_rate"] = max(70, min(95, self.metrics["success_rate"]))
        self.metrics["user_satisfaction"] = max(85, min(98, self.metrics["user_satisfaction"]))
        
        await self.ws_manager.send_live_metrics(self.metrics)
    
    async def increment_analysis_count(self):
        """Increment analysis count"""
        self.metrics["analyses_today"] += 1
        await self.update_metrics()
    
    async def update_analysis_time(self, duration: float):
        """Update average analysis time"""
        # Simple moving average
        self.metrics["avg_analysis_time"] = (
            self.metrics["avg_analysis_time"] * 0.9 + duration * 0.1
        )
        await self.update_metrics()

# Global metrics updater
metrics_updater = LiveMetricsUpdater(websocket_manager)