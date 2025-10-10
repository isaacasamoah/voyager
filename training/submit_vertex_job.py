#!/usr/bin/env python3
"""
Submit Llama 3 Fine-Tuning Job to Vertex AI
============================================

⚠️  ARCHIVED: This script was created for GCP Vertex AI deployment
Current approach: Train on Kaggle (free GPU) instead of GCP ($0.54/hour)
Kept for reference or future enterprise deployment

This script creates and submits a custom container training job to Google Cloud Vertex AI.

What it does:
1. Configures a GPU training environment
2. Passes secrets (HF token, W&B key) as environment variables
3. Submits job to run your Docker container
4. Monitors progress and returns results
"""

import os
from google.cloud import aiplatform

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# GCP Configuration
PROJECT_ID = "voyager-ai-1759900320"
REGION = "us-central1"  # Same region as your GCS data
STAGING_BUCKET = "gs://voyager-training-data"  # For Vertex AI logs/outputs

# Docker Image
CONTAINER_URI = "us-central1-docker.pkg.dev/voyager-ai-1759900320/ml-images/llama3-space-trainer:v1"

# Machine Configuration
MACHINE_TYPE = "n1-standard-4"          # 4 CPUs, 15GB RAM
ACCELERATOR_TYPE = "NVIDIA_TESLA_T4"    # T4 GPU (~$0.35/hour)
ACCELERATOR_COUNT = 1                   # 1 GPU

# Training Configuration
DISPLAY_NAME = "llama3-space-reasoning-v1"  # Job name in GCP console

# Secrets (passed as environment variables to the container)
# TODO: Load from environment variables instead of hardcoding
HUGGING_FACE_TOKEN = os.getenv("HUGGING_FACE_TOKEN")  # Get from .env file
WANDB_API_KEY = os.getenv("WANDB_API_KEY")  # Get from .env file

# ==============================================================================
# SUBMIT TRAINING JOB
# ==============================================================================

def submit_training_job():
    """
    Submit the custom container training job to Vertex AI.

    What happens:
    1. Vertex AI spins up a machine with your specs (n1-standard-4 + T4 GPU)
    2. Pulls your Docker image from Artifact Registry
    3. Runs the container with environment variables
    4. Streams logs to Cloud Logging
    5. Saves outputs to GCS
    6. Shuts down machine when done (stops billing)

    Cost estimate:
    - T4 GPU: ~$0.35/hour
    - n1-standard-4: ~$0.19/hour
    - Total: ~$0.54/hour
    - Expected duration: 2-3 hours
    - Total cost: ~$1-2
    """

    print("=" * 70)
    print("SUBMITTING VERTEX AI TRAINING JOB")
    print("=" * 70)

    # Initialize Vertex AI SDK
    aiplatform.init(
        project=PROJECT_ID,
        location=REGION,
        staging_bucket=STAGING_BUCKET,
    )

    print(f"\n✅ Initialized Vertex AI")
    print(f"   Project: {PROJECT_ID}")
    print(f"   Region: {REGION}")
    print(f"   Staging: {STAGING_BUCKET}")

    # Create Custom Container Training Job
    job = aiplatform.CustomContainerTrainingJob(
        display_name=DISPLAY_NAME,
        container_uri=CONTAINER_URI,
    )

    print(f"\n✅ Created training job: {DISPLAY_NAME}")
    print(f"   Container: {CONTAINER_URI}")

    # Submit the job
    print(f"\n🚀 Submitting job to Vertex AI...")
    print(f"   Machine: {MACHINE_TYPE}")
    print(f"   GPU: {ACCELERATOR_TYPE} x{ACCELERATOR_COUNT}")
    print(f"\n⏳ This will take 2-3 hours. Job runs independently on GCP.")
    print(f"   You can close this terminal - the job continues running.")

    # Run the training job
    # replica_count=1 means single-machine training (no distributed training)
    model = job.run(
        replica_count=1,
        machine_type=MACHINE_TYPE,
        accelerator_type=ACCELERATOR_TYPE,
        accelerator_count=ACCELERATOR_COUNT,

        # Pass secrets as environment variables
        environment_variables={
            "HUGGING_FACE_TOKEN": HUGGING_FACE_TOKEN,
            "WANDB_API_KEY": WANDB_API_KEY,
        },

        # Training runs synchronously (this script waits until complete)
        # Set sync=False to submit and return immediately
        sync=True,
    )

    print("\n" + "=" * 70)
    print("🎉 TRAINING JOB COMPLETE!")
    print("=" * 70)
    print(f"   Job name: {job.display_name}")
    print(f"   Resource name: {job.resource_name}")
    print(f"\n📊 View logs: https://console.cloud.google.com/vertex-ai/training/custom-jobs?project={PROJECT_ID}")
    print(f"📊 View W&B: https://wandb.ai/")

    return job


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == "__main__":
    try:
        job = submit_training_job()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure Vertex AI API is enabled")
        print("2. Check gcloud authentication: gcloud auth application-default login")
        print("3. Verify image exists: gcloud artifacts docker images list us-central1-docker.pkg.dev/voyager-ai-1759900320/ml-images")
        raise
