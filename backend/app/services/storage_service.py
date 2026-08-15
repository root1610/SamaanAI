import os
import uuid
import shutil
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    @staticmethod
    def save_image(file: UploadFile) -> str:
        file_ext = os.path.splitext(file.filename)[1]
        if not file_ext or file_ext.lower() not in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            file_ext = '.jpg'
        
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return static path accessible via web
        return f"/static/uploads/{unique_filename}"

    @staticmethod
    def get_absolute_path(relative_url: str) -> str:
        clean_path = relative_url.lstrip('/')
        return os.path.abspath(clean_path)
