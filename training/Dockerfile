# Dockerfile for Llama 3 Space Reasoning Training
#
# ⚠️  ARCHIVED: This file was created for GCP Vertex AI deployment
# Current approach: Train on Kaggle (free GPU) + Deploy to HuggingFace
# Kept for reference or future enterprise deployment
#
# This creates a container image that Vertex AI will run on a GPU

# ==============================================================================
# BASE IMAGE
# ==============================================================================
# Start with official Python 3.11 slim image (smaller, faster than full Python)
FROM python:3.11-slim

# ==============================================================================
# SYSTEM DEPENDENCIES
# ==============================================================================
# Install system packages needed for PyTorch and ML libraries
# - git: For cloning models from Hugging Face
# - wget: For downloading files
# - build-essential: C/C++ compilers (some Python packages need them)
RUN apt-get update && apt-get install -y \
    git \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*  # Clean up to reduce image size

# ==============================================================================
# WORKING DIRECTORY
# ==============================================================================
# Set /app as the working directory (all commands run from here)
WORKDIR /app

# ==============================================================================
# COPY FILES
# ==============================================================================
# Copy requirements first (Docker caching optimization)
# If requirements.txt doesn't change, Docker reuses the cached pip install layer
COPY requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Now copy the training script
COPY train_space_llm.py /app/train_space_llm.py

# ==============================================================================
# ENVIRONMENT VARIABLES
# ==============================================================================
# PYTHONUNBUFFERED=1: Print logs immediately (don't buffer)
# This is crucial for seeing real-time training progress in Cloud Logging
ENV PYTHONUNBUFFERED=1

# Set a default for Hugging Face cache (Vertex AI provides /gcs for persistent storage)
ENV HF_HOME=/app/cache

# ==============================================================================
# RUNTIME COMMAND
# ==============================================================================
# This is what runs when the container starts
# Vertex AI will execute this command on the GPU machine
CMD ["python", "train_space_llm.py"]
