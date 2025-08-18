from fastapi import FastAPI
from backend.config import settings
from backend.routers import upload, chat
from fastapi.middleware.cors import CORSMiddleware

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

origins = [
    "http://localhost:5173",
    "https://<your-vercel-domain>.vercel.app",   # add after you deploy frontend
    "https://<your-custom-domain>"               # optional
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)