from fastapi import APIRouter, Form, HTTPException
from typing import Optional
from backend.services.embeddings import get_answer_from_openai, get_embedding, qdrant, COLLECTION_NAME

router = APIRouter()

@router.post("/chat")
async def chat_with_documents(
    question: str = Form(...),
    doc_id: Optional[str] = Form(None)
):
    try:
        # here we get the qn embedding
        query_vector = get_embedding(question)
        
        # we search the Qdrant vb for similar  to our search
        search_results = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=5
        )
        
        # 3. check if we get any results
        if not search_results:
            return {
                "answer": "I don't have any relevant information to answer your question. Please upload some documents first.",
                "sources": [],
                "status": "success"
            }
        
        # 4. we try to build context from retrieved chunks
        context_chunks = []
        sources = []
        for result in search_results:
            chunk_text = result.payload.get("text", "")
            source_info = {
                "title": result.payload.get("title", "Unknown"),
                "author": result.payload.get("author", "Unknown"), 
                "filename": result.payload.get("filename", "Unknown")
            }
            context_chunks.append(chunk_text)
            sources.append(source_info)
        
        # 5. we build context string which is going to be used in openAI
        context = "\n\n".join(context_chunks)
        # 6. Use the existing OpenAI function we already have in embeddings.py
        answer = get_answer_from_openai(question, context)
        return {
            "answer": answer,
            "sources": sources[:3],  # Return top 3 sources
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")