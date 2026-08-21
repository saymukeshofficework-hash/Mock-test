import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = Path(os.getenv("REMIX_UPLOAD_DIR", BASE_DIR / "uploads"))
EXPORT_DIR = Path(os.getenv("REMIX_EXPORT_DIR", BASE_DIR / "exports"))
TMP_DIR = Path(os.getenv("REMIX_TMP_DIR", BASE_DIR / "tmp"))
PROJECT_DIR = Path(os.getenv("REMIX_PROJECT_DIR", BASE_DIR / "projects"))

for d in (UPLOAD_DIR, EXPORT_DIR, TMP_DIR, PROJECT_DIR):
    d.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_MB = float(os.getenv("REMIX_MAX_UPLOAD_MB", "60"))
MAX_DURATION_SEC = float(os.getenv("REMIX_MAX_DURATION_SEC", "600"))  # 10 minutes
WORKING_SAMPLE_RATE = int(os.getenv("REMIX_SAMPLE_RATE", "44100"))

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}
ALLOWED_MIME_PREFIXES = ("audio/", "video/mp4")  # some browsers report m4a as video/mp4/audio/x-m4a

CORS_ORIGINS = os.getenv("REMIX_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

ENABLE_DEMUCS = os.getenv("REMIX_ENABLE_DEMUCS", "false").lower() in ("1", "true", "yes")

FILE_RETENTION_HOURS = float(os.getenv("REMIX_FILE_RETENTION_HOURS", "6"))

TARGET_LUFS = float(os.getenv("REMIX_TARGET_LUFS", "-14.0"))
