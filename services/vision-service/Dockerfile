# Vision Service - Dockerfile (Fixed Version)
# Force rebuild by changing all layer hashes

FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        postgresql-client \
        curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Python dependencies step by step to avoid cache
RUN pip install --upgrade pip
RUN pip install setuptools wheel
RUN pip install "fastapi==0.115.0"
RUN pip install "uvicorn[standard]==0.32.0"
RUN pip install "pydantic==2.9.2"
RUN pip install "pydantic-settings==2.6.0"
RUN pip install "python-dotenv==1.0.1"
RUN pip install "sqlalchemy==2.0.35"
RUN pip install "asyncpg==0.29.0"
RUN pip install "psycopg2-binary==2.9.9"
RUN pip install "python-jose[cryptography]==3.3.0"
RUN pip install "passlib[bcrypt]==1.7.4"
RUN pip install "python-multipart==0.0.12"
RUN pip install "aiofiles==24.1.0"
RUN pip install "httpx==0.27.2"
RUN pip install "redis==5.2.0"
RUN pip install "openai>=1.0.0"

# Verify installation
RUN python -c "import uvicorn; print(f'uvicorn: {uvicorn.__version__}')" && \
    python -c "import fastapi; print(f'fastapi: {fastapi.__version__}')" && \
    echo "All dependencies verified!"

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH="/app:$PYTHONPATH"

# Expose port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8003/ || exit 1

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
