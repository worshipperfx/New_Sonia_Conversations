# Dockerfile (repo root)
FROM python:3.11-slim

# Good defaults
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# (Optional) system deps if any wheel needs compiling; safe to keep
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip \
 && python -m pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code
COPY backend /app/backend

# Railway supplies $PORT at runtime; default to 8000 if missing (local run)
EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.test_backend:app --host 0.0.0.0 --port ${PORT:-8000}"]
