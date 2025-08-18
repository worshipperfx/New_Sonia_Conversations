from pydantic import BaseModel
from typing import Optional

class UploadMetadata(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
