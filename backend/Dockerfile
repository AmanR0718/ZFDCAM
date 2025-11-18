# Zambian Farmer System Backend Dockerfile
# Base image: python 3.11-slim for minimal footprint and latest Python features

FROM python:3.11-slim

# Environment variables to improve python behavior in containers
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

# Set working directory inside container
WORKDIR /app

# Install system dependencies needed for image and compression libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    netcat-openbsd \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy all source code and configuration files
COPY app ./app
COPY .env ./.env
COPY scripts ./scripts

# Create upload directories (use volumes during deployment)
RUN mkdir -p /app/uploads/photos /app/uploads/idcards /app/uploads/documents

# Expose the port uvicorn listens on
EXPOSE 8000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8000/health/full || exit 1

# Command to wait for MongoDB before starting app
CMD ["sh", "-c", "\
until nc -z farmer-mongo 27017; do echo '⏳ Waiting for Mongo...'; sleep 3; done && \
echo '✅ Mongo is ready! Starting backend...' && \
python scripts/seed_admin.py || true && \
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
