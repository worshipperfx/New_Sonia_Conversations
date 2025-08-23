import os
from pathlib import Path
from typing import List
from PyPDF2 import PdfReader
import docx
import re

# extract text from PDF
def extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

# extracting text from DOCX
def extract_docx_text(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

# extracting text from TXT
def extract_txt_text(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

# here its to detect file type by reading file magic bytes
def detect_file_type(file_path: str) -> str:
    """
    magic number is used detect file type by reading the first few bytes because names cam be misleading.
    Returns the file extension that should be used.
    """
    try:
        with open(file_path, "rb") as f:
            header = f.read(8)
        if header.startswith(b"%PDF"):
            return ".pdf"
        if header.startswith(b"PK\x03\x04") or header.startswith(b"PK\x05\x06") or header.startswith(b"PK\x07\x08"):
            return ".docx"
        
        # If we can't detect from magic byte we read as text
        # this is a fallback for plain text files
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                f.read(100)  # we read first 100 chars as text
            return ".txt"
        except UnicodeDecodeError:
            # If it's not readable as text we dont know what it is thats why we return None
            return None
            
    except Exception:
        return None

def extract_text(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    
    # call detect_file_type if no extension is provided
    if not ext:
        detected_ext = detect_file_type(file_path)
        if detected_ext:
            ext = detected_ext
        else:
            raise ValueError(f"Cannot determine file type for: {file_path}. Supported types: .pdf, .docx, .txt")
    
    if ext == ".pdf":
        return extract_pdf_text(file_path)
    elif ext == ".docx":
        return extract_docx_text(file_path)
    elif ext == ".txt":
        return extract_txt_text(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Supported types: .pdf, .docx, .txt")

# we break text into smaller chunks for embeddings
def chunk_text(text: str, max_tokens: int = 1500) -> List[str]:
    # Clean up the text first
    text = text.replace('\r\n', '\n')  # Normalize line endings
    text = ' '.join(text.split())  # Remove excessive whitespace
    
    # Split by sentences instead of paragraphs
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_tokens:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    # If still only 1 chunk, force split it
    if len(chunks) == 1 and len(text) > max_tokens:
        single_chunk = chunks[0]
        chunks = []
        for i in range(0, len(single_chunk), max_tokens):
            chunks.append(single_chunk[i:i+max_tokens])
    
    return chunks
