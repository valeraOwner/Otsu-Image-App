# config.py
import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'images')
    PROCESSED_FOLDER = os.path.join(BASE_DIR, 'static', 'processed')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

    # Otros parámetros que puedas necesitar en el futuro
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
