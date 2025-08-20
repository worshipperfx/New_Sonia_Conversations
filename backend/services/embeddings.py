import os

# Get environment variables
openai_api_key = os.environ.get("OPENAI_API_KEY")
qdrant_url = os.environ.get("QDRANT_URL") 
qdrant_api_key = os.environ.get("QDRANT_API_KEY")

print("=== ENVIRONMENT DEBUG ===")
print(f"OPENAI_API_KEY found: {'Yes' if openai_api_key else 'No'}")
print(f"QDRANT_URL found: {'Yes' if qdrant_url else 'No'}")
print(f"QDRANT_API_KEY found: {'Yes' if qdrant_api_key else 'No'}")
print("=== END DEBUG ===")

# Validate environment variables
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# DON'T initialize OpenAI client here - do it in functions when needed
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from uuid import uuid4

qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
COLLECTION_NAME = "sonia_documents"
DIMENSIONS = 1536

def get_openai_client():
    """Initialize OpenAI client only when needed"""
    from openai import OpenAI
    return OpenAI(api_key=openai_api_key)

def get_embedding(text: str) -> list[float]:
    if not text or not isinstance(text, str):
        raise ValueError("Text input must be a non-empty string")
    
    cleaned_text = text.strip()
    if len(cleaned_text) > 8000: 
        cleaned_text = cleaned_text[:8000]
    
    client = get_openai_client()  # Initialize here, not at module level
    response = client.embeddings.create(
        input=cleaned_text,  
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def store_text_embedding(text: str, metadata: dict = None):
    if metadata is None:
        metadata = {}
    vector = get_embedding(text)
    point = PointStruct(
        id=str(uuid4()),
        vector=vector,
        payload={"text": text, **metadata}
    )
    qdrant.upsert(collection_name=COLLECTION_NAME, points=[point])

def search_similar(query: str, top_k: int = 5):
    query_vector = get_embedding(query)
    results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k
    )
    return [hit.payload["text"] for hit in results]

def get_answer_from_openai(question: str, context: str) -> str:
    client = get_openai_client()  # Initialize here, not at module level
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
        ],
        max_tokens=1000,
        temperature=0.3
    )
    return response.choices[0].message.content.strip()