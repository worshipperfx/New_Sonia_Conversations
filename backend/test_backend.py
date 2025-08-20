from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Railway test working"}

@app.get("/healthz") 
def health():
    return {"status": "ok"}