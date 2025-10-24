import os
import uvicorn
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_routes, input_routes, chat_routes
from core.database import Base, engine
try:
    from core.websocket_manager import metrics_updater
except ImportError:
    metrics_updater = None

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router)
app.include_router(input_routes.router)
app.include_router(chat_routes.router)

# Start background tasks
@app.on_event("startup")
async def startup_event():
    # Start metrics updater if available
    if metrics_updater:
        asyncio.create_task(metrics_updater.start_periodic_updates())

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)