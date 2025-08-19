from openai import OpenAI
import openai
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from uuid import uuid4
from dotenv import load_dotenv
import os

# Load from env
load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

openai_client = OpenAI(api_key=openai_api_key)
qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

# use the collection in exists
COLLECTION_NAME = "sonia_documents"
DIMENSIONS = 1536  # OpenAI embedding size

def create_collection_if_not_exists():
    if COLLECTION_NAME not in qdrant.get_collections().collections:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=DIMENSIONS, distance=Distance.COSINE),
        )

# here we turn text into embeddings
def get_embedding(text: str) -> list[float]:
    # clean and validate the text input
    if not text or not isinstance(text, str):
        raise ValueError("Text input must be a non-empty string")
    
    # clean the text tp remove excessive whitespace 
    cleaned_text = text.strip()
    if not cleaned_text:
        raise ValueError("Text input cannot be empty after cleaning")
    
    if len(cleaned_text) > 8000: 
        cleaned_text = cleaned_text[:8000]
    try:
        response =  openai_client.embeddings.create(
            input=cleaned_text,  
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding for text: {cleaned_text[:100]}...")
        print(f"Error details: {str(e)}")
        raise e

# her its to save to qdrant
def store_text_embedding(text: str, metadata: dict = {}):
    create_collection_if_not_exists()
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