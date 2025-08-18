from fastapi import FastAPI
from backend.config import settings
from backend.routers import upload, chat

app = FastAPI(
    title="Sonia Conversations API",
    description="An intelligent document chatbot backend using Qdrant + OpenAI",
    version="1.0.0"
)
@app.get("/")
def root():
    return {"message": "Sonia Conversations backend is running"}
# register routes
app.include_router(upload.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
