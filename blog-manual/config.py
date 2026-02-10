import os

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "blog.db")
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "uploads")
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB per file
MAX_IMAGE_PIXELS = (1200, 800)
MAX_MEMBERS = 10
MAX_POSTS_PER_USER = 10
POST_ARCHIVE_MONTHS = 18

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

def get_upload_folder():
    return UPLOAD_FOLDER

def allowed_file(filename):
    if not filename or "." not in filename:
        return False
    return filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
