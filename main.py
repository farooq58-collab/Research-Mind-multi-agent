import json
import logging
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pipeline import stream_research_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("research-assistant")

app = FastAPI(title="AI Research Assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/agents")
async def get_agents():
    return [
        {
            "id": "search_agent",
            "name": "Search Agent",
            "role": "Information Retriever",
            "description": "Searches the web via Tavily API to find relevant resources and articles.",
            "status": "idle",
            "avatar": "🔍"
        },
        {
            "id": "reader_agent",
            "name": "Reader Agent",
            "role": "Content Scraper",
            "description": "Scrapes and parses clean text content from selected URLs using BeautifulSoup.",
            "status": "idle",
            "avatar": "📖"
        },
        {
            "id": "writer_chain",
            "name": "Writer Agent",
            "role": "Report Drafter",
            "description": "Synthesizes gathered research into a structured, professional Markdown report.",
            "status": "idle",
            "avatar": "✍️"
        },
        {
            "id": "critic_chain",
            "name": "Critic Agent",
            "role": "Quality Inspector",
            "description": "Constructively critiques the report, assigns a quality score, and suggests improvements.",
            "status": "idle",
            "avatar": "🔬"
        }
    ]

@app.get("/api/projects")
async def get_projects():
    return [
        {"id": "proj-1", "name": "AI Market Trends 2026", "count": 12},
        {"id": "proj-2", "name": "Renewable Energy Tech", "count": 5},
        {"id": "proj-3", "name": "Biotech Breakthroughs", "count": 8},
        {"id": "proj-4", "name": "Quantum Computing Basics", "count": 3}
    ]

# In-memory history cache
chat_sessions = []

@app.get("/api/history")
async def get_history():
    return chat_sessions

@app.websocket("/api/ws/research")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established.")
    try:
        while True:
            # Receive topic from client
            data = await websocket.receive_text()
            payload = json.loads(data)
            topic = payload.get("topic", "")
            
            if not topic:
                await websocket.send_json({"event": "error", "message": "No topic provided"})
                continue
                
            # Add topic to active history list if not already present
            if not any(s["title"] == topic for s in chat_sessions):
                chat_sessions.insert(0, {
                    "id": f"chat-{int(time.time() * 1000)}",
                    "title": topic,
                    "project_id": "proj-1",
                    "date": "Today"
                })
                
            logger.info(f"Starting research pipeline for topic: {topic}")
            
            # Stream the pipeline events
            async for event in stream_research_pipeline(topic):
                await websocket.send_json(event)
                
            logger.info("Research pipeline finished.")
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({"event": "error", "message": str(e)})
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
