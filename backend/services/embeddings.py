import os
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from uuid import uuid4

# Get environment variables
openai_api_key = os.environ.get("OPENAI_API_KEY")
qdrant_url = os.environ.get("QDRANT_URL") 
qdrant_api_key = os.environ.get("QDRANT_API_KEY")

# Debug logging
print("=== ENVIRONMENT DEBUG ===")
print(f"OPENAI_API_KEY found: {'Yes' if openai_api_key else 'No'}")
print(f"QDRANT_URL found: {'Yes' if qdrant_url else 'No'}")
print(f"QDRANT_API_KEY found: {'Yes' if qdrant_api_key else 'No'}")
if openai_api_key:
    print(f"OpenAI key starts with: {openai_api_key[:10]}...")
print("=== END DEBUG ===")

# Validate environment variables
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")
if not qdrant_url:
    raise ValueError("QDRANT_URL environment variable is required") 
if not qdrant_api_key:
    raise ValueError("QDRANT_API_KEY environment variable is required")

# Initialize OpenAI client
try:
    openai_client = OpenAI(api_key=openai_api_key)
    print("✅ OpenAI client initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize OpenAI client: {e}")
    raise

# Initialize Qdrant client
try:
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    print("✅ Qdrant client initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Qdrant client: {e}")
    raise

# Constants
COLLECTION_NAME = "sonia_documents"
DIMENSIONS = 1536  # OpenAI embedding size

def create_collection_if_not_exists():
    try:
        collections = qdrant.get_collections()
        collection_names = [col.name for col in collections.collections]
        
        if COLLECTION_NAME not in collection_names:
            qdrant.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=DIMENSIONS, distance=Distance.COSINE),
            )
            print(f"✅ Created collection: {COLLECTION_NAME}")
        else:
            print(f"✅ Collection {COLLECTION_NAME} already exists")
    except Exception as e:
        print(f"❌ Error with collection: {e}")
        raise

def get_embedding(text: str) -> list[float]:
    """Convert text to embeddings using OpenAI"""
    if not text or not isinstance(text, str):
        raise ValueError("Text input must be a non-empty string")
    
    cleaned_text = text.strip()
    if not cleaned_text:
        raise ValueError("Text input cannot be empty after cleaning")
    
    # Truncate if too long
    if len(cleaned_text) > 8000: 
        cleaned_text = cleaned_text[:8000]
    
    try:
        response = openai_client.embeddings.create(
            input=cleaned_text,  
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Error getting embedding: {e}")
        print(f"Text preview: {cleaned_text[:100]}...")
        raise

def store_text_embedding(text: str, metadata: dict = None):
    """Store text embedding in Qdrant"""
    if metadata is None:
        metadata = {}
        
    create_collection_if_not_exists()
    vector = get_embedding(text)
    point = PointStruct(
        id=str(uuid4()),
        vector=vector,
        payload={"text": text, **metadata}
    )
    qdrant.upsert(collection_name=COLLECTION_NAME, points=[point])

def search_similar(query: str, top_k: int = 5):
    """Search for similar text in Qdrant"""
    query_vector = get_embedding(query)
    results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k
    )
    return [hit.payload["text"] for hit in results]

def get_answer_from_openai(question: str, context: str) -> str:
    """Get answer from OpenAI based on context"""
    enhanced_prompt = f"""Based on the following document excerpts, please answer the user's question with clear, well-structured formatting.

Context from documents:
{context}

User Question: {question}

Instructions for your response:
- Provide a clear, well-structured answer
- Use bullet points (with -) when listing items
- Use numbered lists (1., 2., 3.) for steps or sequences
- Break up long content into short paragraphs (2-3 sentences max)
- Use **bold text** for key terms or important points
- If citing specific information, mention the source document
- Be conversational but professional
- Use line breaks between different points or sections

Answer:"""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": """You are Sonia AI, a helpful document analysis assistant. 

Format your responses clearly and professionally:
- Use line breaks between paragraphs for better readability
- Use bullet points (-) for lists of items
- Use numbered lists (1., 2., 3.) for steps or sequences  
- Use **bold text** for key terms and important points
- Keep paragraphs concise (2-3 sentences maximum)
- Always be helpful, accurate, and conversational
- If you can't find the answer in the context, say so clearly
- When referencing information, mention which document it came from when possible"""
                },
                {"role": "user", "content": enhanced_prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Error getting OpenAI response: {e}")
        raise