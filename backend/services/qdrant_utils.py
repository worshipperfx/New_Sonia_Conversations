from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from backend.services.embeddings import get_embedding
from uuid import uuid4
import os

# connect to qdrant cloud
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

COLLECTION_NAME = "sonia_docs"

def create_collection():
    try:
        collections = client.get_collections().collections
        if COLLECTION_NAME not in [col.name for col in collections]:
            client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
            )
            print(f"Created collection: {COLLECTION_NAME}")
        else:
            print(f"Collection {COLLECTION_NAME} already exists")
    except Exception as e:
        print(f"Error creating collection: {e}")
        raise e

# use chunks from document_parser.py as embeddings
def add_to_qdrant(chunks, metadata):
    create_collection()
    vectors = [get_embedding(chunk) for chunk in chunks]
    points = [
        PointStruct(
            id=str(uuid4()),
            vector=vec,
            payload={**metadata, "text": chunk}
        )
        for chunk, vec in zip(chunks, vectors)
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)

def search_qdrant(query, top_k=5):
    create_collection()
    query_vector = get_embedding(query)
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k
    )
    return results