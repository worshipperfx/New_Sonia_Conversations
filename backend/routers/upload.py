from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.document_parser import extract_text, chunk_text
from backend.services.qdrant_utils import add_to_qdrant
import tempfile
import json
import os
from pathlib import Path

router = APIRouter()

# MIME type to extension mapping
# MIME means meadia type which indicates the type of file being uploaded
MIME_TO_EXTENSION = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
}

def get_file_extension(filename: str, content_type: str) -> str:
    """Get file extension from filename or content type"""
    # we get extension from filename first
    if filename:
        ext = Path(filename).suffix.lower()
        if ext in [".pdf", ".docx", ".txt"]:
            return ext
    
    # we go backto content type
    if content_type in MIME_TO_EXTENSION:
        return MIME_TO_EXTENSION[content_type]
    # I used this as default if no extension is found
    return ".txt"

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    metadata: str = Form(None)
):
    temp_path = None
    
    try:
        # we try to get  the file extension
        file_extension = get_file_extension(file.filename, file.content_type or "")
        # we create a tem file with the correct extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name
        # we extract text using the existing function in document_parser.py
        text = extract_text(temp_path)
        chunks = chunk_text(text)
        # Filter out empty chunks
        chunks = [chunk for chunk in chunks if chunk and isinstance(chunk, str) and chunk.strip()]
        
        if not chunks:
            raise HTTPException(status_code=422, detail="No valid text chunks could be created from the file")

        # handle metadata parsing safely
        if metadata and metadata.strip():
            try:
                metadata_dict = json.loads(metadata)
            except json.JSONDecodeError:
                # If JSON file  is invalid use defaults
                metadata_dict = {
                    "title": file.filename or "unknown_file",
                    "author": "unknown",
                    "description": "No description provided (invalid JSON)"
                }
        else:
            # here its if metadata is None or empty, use defaults
            metadata_dict = {
                "title": file.filename or "unknown_file",
                "author": "unknown",
                "description": "No description provided"
            }

        # add to qdrant using the existing function in qdrant_utils.py
        add_to_qdrant(chunks, metadata_dict)
        return {"status": "success", "chunks_uploaded": len(chunks)}
        
    except Exception as e:
        # handle any errors gracefully
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
        
    finally:
        # we clean up the temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass  # Ignore cleanup errors