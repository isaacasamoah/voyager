"""
Vertex AI Training Script for Space Reasoning LLM
Fine-tunes Llama 3 8B on orbital mechanics problems with step-by-step solutions
"""

import os
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset
import wandb

# ============================================================================
# STEP 1: LOAD LLAMA 3 8B WITH 4-BIT QUANTIZATION
# ============================================================================

def load_model_and_tokenizer(model_name="meta-llama/Meta-Llama-3-8B"):
    """
    Load Llama 3 8B with 4-bit quantization for memory efficiency.

    Why 4-bit quantization?
    - Reduces VRAM from ~16GB to ~4GB
    - Minimal accuracy loss for fine-tuning
    - Enables training on T4/V100 GPUs

    Args:
        model_name: Hugging Face model ID

    Returns:
        model: Quantized model ready for LoRA
        tokenizer: Llama 3 tokenizer
    """

    print("🚀 Loading Llama 3 8B with 4-bit quantization...")

    # Configure 4-bit quantization
    # NF4 = Normal Float 4-bit (optimal for transformers)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,                    # Enable 4-bit loading
        bnb_4bit_quant_type="nf4",           # Use NF4 quantization
        bnb_4bit_compute_dtype=torch.float16, # Compute in FP16 for speed
        bnb_4bit_use_double_quant=True,      # Nested quantization (saves more memory)
    )

    # Load model with quantization
    # device_map="auto" automatically distributes layers across available GPUs
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        token=os.getenv("HUGGING_FACE_TOKEN")  # Required for gated models
    )

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        token=os.getenv("HUGGING_FACE_TOKEN")
    )

    # Set padding token (Llama doesn't have one by default)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        model.config.pad_token_id = model.config.eos_token_id

    print(f"✅ Model loaded: {model.get_memory_footprint() / 1e9:.2f} GB")
    print(f"   Device map: {model.hf_device_map}")

    return model, tokenizer


# ============================================================================
# STEP 2: APPLY LORA ADAPTERS
# ============================================================================

def apply_lora(model):
    """
    Apply LoRA (Low-Rank Adaptation) to the quantized model.

    What is LoRA?
    - Freezes original model weights (all 8B parameters)
    - Adds small trainable "adapter" matrices to specific layers
    - Only trains ~0.5% of parameters (40M out of 8B)
    - Results in fast, memory-efficient fine-tuning

    How it works mathematically:
    - Original: h = W × x  (W is 4096×4096, frozen)
    - LoRA: h = W × x + (B × A) × x  (B is 4096×32, A is 32×4096, trainable)
    - The rank r=32 controls adapter capacity

    Args:
        model: Quantized Llama 3 model from Step 1

    Returns:
        model: Model with LoRA adapters attached and ready to train
    """

    print("🔧 Applying LoRA adapters...")

    # Prepare model for k-bit training (required for quantized models)
    # This enables gradient checkpointing and other optimizations
    model = prepare_model_for_kbit_training(model)

    # Configure LoRA
    lora_config = LoraConfig(
        r=32,                          # Rank: higher = more capacity (16-64 typical)
        lora_alpha=64,                 # Scaling factor (typically 2×r)
        lora_dropout=0.05,             # Dropout for regularization
        bias="none",                   # Don't adapt bias terms
        task_type="CAUSAL_LM",         # Causal language modeling (next token prediction)

        # Target modules: which layers get LoRA adapters
        # From DUAL_TRACK_MASTERY.md - all attention + FFN projections
        target_modules=[
            # Self-attention projections (learned in Tensor Temple Module 1-2)
            "q_proj",    # Query projection
            "k_proj",    # Key projection
            "v_proj",    # Value projection
            "o_proj",    # Output projection

            # Feed-forward network (learned in Tensor Temple Module 3)
            "gate_proj", # Gate for SwiGLU activation
            "up_proj",   # Expansion projection
            "down_proj", # Compression projection
        ],
    )

    # Apply LoRA to model
    model = get_peft_model(model, lora_config)

    # Print trainable parameters
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    trainable_percent = 100 * trainable_params / total_params

    print(f"✅ LoRA applied:")
    print(f"   Trainable params: {trainable_params:,} ({trainable_percent:.2f}%)")
    print(f"   Total params: {total_params:,}")
    print(f"   Memory footprint: {model.get_memory_footprint() / 1e9:.2f} GB")

    return model


# ============================================================================
# STEP 3: LOAD TRAINING DATA
# ============================================================================

def load_training_data(data_path="gs://voyager-training-data/space_reasoning.jsonl", tokenizer=None):
    """
    Load and preprocess training data from GCS.

    Data format (JSONL with chat messages):
    {
      "messages": [
        {"role": "user", "content": "Calculate delta-v for Hohmann transfer..."},
        {"role": "assistant", "content": "**Step 1: Current velocity**\\nv₁ = √(μ/r₁)..."}
      ]
    }

    What we do:
    1. Load from GCS using datasets library
    2. Format into Llama 3 chat template
    3. Tokenize (convert text → token IDs)
    4. Create train/validation split (90/10)

    Args:
        data_path: GCS path or local path to JSONL file
        tokenizer: Llama 3 tokenizer from Step 1

    Returns:
        train_dataset: Training dataset (90% of data)
        eval_dataset: Evaluation dataset (10% of data)
    """

    print("📂 Loading training data from GCS...")

    # Load dataset from GCS
    # datasets library automatically handles gs:// URIs
    dataset = load_dataset("json", data_files=data_path, split="train")

    print(f"   Loaded {len(dataset)} examples")
    print(f"   Sample: {dataset[0]['messages'][0]['content'][:100]}...")

    # Formatting function: Convert chat messages to Llama 3 format
    def format_chat(example):
        """
        Convert messages to Llama 3 chat template and tokenize.

        Llama 3 chat format:
        <|begin_of_text|><|start_header_id|>user<|end_header_id|>
        {user_message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
        {assistant_message}<|eot_id|>
        """
        # Apply chat template (tokenizer handles the special tokens)
        text = tokenizer.apply_chat_template(
            example["messages"],
            tokenize=False,  # Get text first
            add_generation_prompt=False  # Include assistant response
        )

        # Tokenize
        tokenized = tokenizer(
            text,
            truncation=True,
            max_length=1024,  # Max sequence length (from your docs)
            padding="max_length",
            return_tensors=None  # Return lists, not tensors
        )

        # For causal LM, labels = input_ids (model predicts next token)
        tokenized["labels"] = tokenized["input_ids"].copy()

        return tokenized

    print("🔤 Tokenizing dataset...")
    tokenized_dataset = dataset.map(
        format_chat,
        remove_columns=dataset.column_names,  # Remove original columns
        desc="Tokenizing"
    )

    # Split into train/eval (90/10)
    split_dataset = tokenized_dataset.train_test_split(
        test_size=0.1,
        seed=42
    )

    train_dataset = split_dataset["train"]
    eval_dataset = split_dataset["test"]

    print(f"✅ Data prepared:")
    print(f"   Training examples: {len(train_dataset)}")
    print(f"   Evaluation examples: {len(eval_dataset)}")
    print(f"   Max sequence length: 1024 tokens")

    return train_dataset, eval_dataset


# ============================================================================
# STEP 4A: CONFIGURE WEIGHTS & BIASES
# ============================================================================

def setup_wandb(project_name="voyager-space-reasoning", run_name=None):
    """
    Initialize Weights & Biases for training monitoring.

    Why W&B?
    - Real-time loss curves and metrics
    - Compare training runs
    - Track hyperparameters
    - Free for personal use

    What you'll see:
    - Training/eval loss over time
    - Learning rate schedule
    - GPU memory usage
    - Gradient norms
    - Sample generations

    Args:
        project_name: W&B project name
        run_name: Optional run name (auto-generated if None)

    Returns:
        None (initializes wandb globally)
    """

    print("📊 Setting up Weights & Biases monitoring...")

    # Initialize W&B
    # On first run, this will prompt you to login via browser
    wandb.init(
        project=project_name,
        name=run_name,
        config={
            "model": "meta-llama/Meta-Llama-3-8B",
            "lora_rank": 32,
            "lora_alpha": 64,
            "dataset": "space_reasoning",
            "num_examples": 945,
        }
    )

    print(f"✅ W&B initialized")
    print(f"   Project: {project_name}")
    print(f"   Dashboard: {wandb.run.get_url()}")


# ============================================================================
# STEP 4B: CONFIGURE TRAINING PARAMETERS
# ============================================================================

def get_training_args(output_dir="./llama3-space-reasoning"):
    """
    Configure training hyperparameters.

    Key decisions explained:

    **Learning Rate (1e-4):**
    - LoRA uses lower LR than full fine-tuning (typically 1e-4 to 3e-4)
    - Too high = unstable training, loss explodes
    - Too low = slow convergence, underfitting
    - 1e-4 is safe starting point from your docs

    **Batch Size & Gradient Accumulation:**
    - per_device_train_batch_size=2 → Process 2 examples at once
    - gradient_accumulation_steps=8 → Accumulate 8 batches before updating
    - Effective batch size = 2 × 8 = 16
    - Why? Fits in GPU memory while simulating larger batch

    **Epochs (5):**
    - 945 examples × 5 epochs = 4,725 training steps
    - From your docs: More epochs for reasoning tasks
    - Will monitor eval loss to prevent overfitting

    **Sequence Length (1024):**
    - Max tokens per example
    - Covers most solutions with full reasoning steps
    - Longer = more memory but complete context

    **Mixed Precision (fp16):**
    - Train in 16-bit instead of 32-bit
    - 2x faster, 2x less memory
    - Minimal accuracy loss

    Args:
        output_dir: Where to save checkpoints

    Returns:
        TrainingArguments: Configuration object
    """

    print("⚙️  Configuring training parameters...")

    training_args = TrainingArguments(
        # Output
        output_dir=output_dir,
        overwrite_output_dir=True,

        # Training hyperparameters
        num_train_epochs=5,              # From SPACE_REASONING_LLM_TRAINING.md
        learning_rate=1e-4,              # Conservative for LoRA
        lr_scheduler_type="cosine",      # Smooth decay (better than linear)
        warmup_ratio=0.05,               # 5% warmup (stabilizes start)

        # Batch sizes
        per_device_train_batch_size=2,   # Fits in most GPUs
        per_device_eval_batch_size=2,
        gradient_accumulation_steps=8,   # Effective batch size = 16

        # Optimization
        optim="adamw_torch",             # AdamW optimizer (standard)
        weight_decay=0.01,               # Regularization
        max_grad_norm=1.0,               # Gradient clipping (prevents explosions)

        # Precision
        fp16=True,                       # Mixed precision training

        # Evaluation & Logging
        eval_strategy="steps",           # Evaluate every N steps
        eval_steps=100,                  # Evaluate every 100 steps
        logging_steps=10,                # Log to W&B every 10 steps
        save_strategy="steps",
        save_steps=500,                  # Save checkpoint every 500 steps
        save_total_limit=2,              # Keep only 2 latest checkpoints

        # Memory optimization
        gradient_checkpointing=True,     # Trade compute for memory

        # Reporting
        report_to="wandb",               # Send metrics to W&B
        run_name="llama3-space-v1",      # W&B run name

        # Other
        seed=42,                         # Reproducibility
        dataloader_num_workers=2,        # Parallel data loading
    )

    print(f"✅ Training configured:")
    print(f"   Epochs: {training_args.num_train_epochs}")
    print(f"   Learning rate: {training_args.learning_rate}")
    print(f"   Effective batch size: {training_args.per_device_train_batch_size * training_args.gradient_accumulation_steps}")
    print(f"   Total steps: ~{(945 * training_args.num_train_epochs) // (training_args.per_device_train_batch_size * training_args.gradient_accumulation_steps)}")
    print(f"   Checkpoints: {output_dir}")

    return training_args


# ============================================================================
# STEP 4C: CREATE TRAINER AND START TRAINING
# ============================================================================

def train_model(model, tokenizer, train_dataset, eval_dataset, training_args):
    """
    Create Trainer and start the fine-tuning process.

    What is the Trainer?
    - Hugging Face's high-level training loop
    - Handles: forward pass, loss calculation, backward pass, optimization
    - Automatic: gradient accumulation, mixed precision, checkpointing
    - Integrates with W&B for logging

    Training loop (simplified):
    ```
    for epoch in range(5):
        for batch in train_dataset:
            # Forward pass
            outputs = model(batch)
            loss = outputs.loss

            # Backward pass
            loss.backward()

            # Update weights (every 8 batches)
            if step % gradient_accumulation_steps == 0:
                optimizer.step()
                optimizer.zero_grad()

            # Evaluate
            if step % 100 == 0:
                eval_loss = evaluate(eval_dataset)
                log_to_wandb(loss, eval_loss)

            # Save checkpoint
            if step % 500 == 0:
                save_model(model)
    ```

    Args:
        model: Llama 3 8B with LoRA adapters
        tokenizer: Llama 3 tokenizer
        train_dataset: Tokenized training data
        eval_dataset: Tokenized evaluation data
        training_args: TrainingArguments from Step 4B

    Returns:
        trainer: Trained model wrapped in Trainer
    """

    print("🚀 Creating Trainer...")

    # Data collator: Batches examples together efficiently
    from transformers import DataCollatorForLanguageModeling
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # Not masked LM, we're doing causal LM
    )

    # Create Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )

    print("✅ Trainer created")
    print("\n" + "=" * 70)
    print("STARTING TRAINING")
    print("=" * 70)
    print(f"📊 Watch progress: {wandb.run.get_url()}\n")

    # Start training!
    trainer.train()

    print("\n" + "=" * 70)
    print("TRAINING COMPLETE!")
    print("=" * 70)

    return trainer


# ============================================================================
# STEP 5: SAVE MODEL TO GCS
# ============================================================================

def save_model_to_gcs(trainer, output_gcs_path="gs://voyager-training-data/models/llama3-space-reasoning"):
    """
    Save the trained LoRA adapters to Google Cloud Storage.

    What gets saved:
    - LoRA adapter weights (~80MB, not the full 8B model!)
    - Tokenizer config
    - Training configuration

    To use later:
    ```python
    from peft import AutoPeftModelForCausalLM
    model = AutoPeftModelForCausalLM.from_pretrained(
        "meta-llama/Meta-Llama-3-8B",
        "gs://voyager-training-data/models/llama3-space-reasoning"
    )
    ```

    Args:
        trainer: Trained Trainer object
        output_gcs_path: GCS path to save adapters

    Returns:
        None
    """

    print("\n💾 Saving model...")

    # Save locally first
    local_path = "./llama3-space-reasoning-final"
    trainer.save_model(local_path)
    print(f"   Saved locally: {local_path}")

    # Upload to GCS
    from google.cloud import storage
    import os

    # Extract bucket and path from gs:// URI
    gcs_parts = output_gcs_path.replace("gs://", "").split("/", 1)
    bucket_name = gcs_parts[0]
    gcs_prefix = gcs_parts[1] if len(gcs_parts) > 1 else ""

    client = storage.Client()
    bucket = client.bucket(bucket_name)

    # Upload all files
    for root, dirs, files in os.walk(local_path):
        for file in files:
            local_file = os.path.join(root, file)
            relative_path = os.path.relpath(local_file, local_path)
            blob_path = os.path.join(gcs_prefix, relative_path)

            blob = bucket.blob(blob_path)
            blob.upload_from_filename(local_file)

    print(f"✅ Model uploaded to: {output_gcs_path}")
    print(f"   Adapter size: ~80MB")
    print(f"   Ready for deployment!")


# ============================================================================
# MAIN TRAINING PIPELINE
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("LLAMA 3 SPACE REASONING TRAINING PIPELINE")
    print("=" * 70)

    # Check for HF token
    if not os.getenv("HUGGING_FACE_TOKEN"):
        print("⚠️  HUGGING_FACE_TOKEN not found in environment!")
        print("   1. Accept license: https://huggingface.co/meta-llama/Meta-Llama-3-8B")
        print("   2. Get token: https://huggingface.co/settings/tokens")
        print("   3. Set: export HUGGING_FACE_TOKEN='your_token_here'")
        exit(1)

    # STEP 1: Load model
    print("\n" + "=" * 70)
    print("STEP 1: LOADING LLAMA 3 8B")
    print("=" * 70)
    model, tokenizer = load_model_and_tokenizer()

    print("\n📊 Model Architecture:")
    print(f"   Total parameters: {model.num_parameters() / 1e9:.2f}B")
    print(f"   Hidden size: {model.config.hidden_size}")
    print(f"   Num layers: {model.config.num_hidden_layers}")
    print(f"   Num attention heads: {model.config.num_attention_heads}")

    # STEP 2: Apply LoRA
    print("\n" + "=" * 70)
    print("STEP 2: APPLYING LORA")
    print("=" * 70)
    model = apply_lora(model)

    # STEP 3: Load data
    print("\n" + "=" * 70)
    print("STEP 3: LOADING TRAINING DATA")
    print("=" * 70)
    train_dataset, eval_dataset = load_training_data(
        data_path="gs://voyager-training-data/space_reasoning.jsonl",
        tokenizer=tokenizer
    )

    # STEP 4A: Setup W&B
    print("\n" + "=" * 70)
    print("STEP 4A: WEIGHTS & BIASES SETUP")
    print("=" * 70)
    setup_wandb(project_name="voyager-space-reasoning", run_name="llama3-space-v1")

    # STEP 4B: Configure training
    print("\n" + "=" * 70)
    print("STEP 4B: TRAINING CONFIGURATION")
    print("=" * 70)
    training_args = get_training_args(output_dir="./llama3-space-reasoning")

    # STEP 4C: Train!
    print("\n" + "=" * 70)
    print("STEP 4C: TRAINING")
    print("=" * 70)
    trainer = train_model(model, tokenizer, train_dataset, eval_dataset, training_args)

    # STEP 5: Save to GCS
    print("\n" + "=" * 70)
    print("STEP 5: SAVING TO GCS")
    print("=" * 70)
    save_model_to_gcs(trainer, output_gcs_path="gs://voyager-training-data/models/llama3-space-reasoning")

    # Done!
    print("\n" + "=" * 70)
    print("🎉 TRAINING PIPELINE COMPLETE!")
    print("=" * 70)
    print(f"📊 View results: {wandb.run.get_url()}")
    print(f"📦 Model saved: gs://voyager-training-data/models/llama3-space-reasoning")
    print(f"\n✨ Your LLM can now reason about space physics!")
