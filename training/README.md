# Llama 3 Space Reasoning Training

This directory contains the training pipeline for fine-tuning Llama 3 8B on orbital mechanics reasoning.

## 📁 Files

### **Core Training Script**
- **`train_space_llm.py`** - Complete training pipeline (Kaggle-ready)
  - Step 1: Load Llama 3 8B with 4-bit quantization
  - Step 2: Apply LoRA adapters
  - Step 3: Load training data
  - Step 4: Configure training with W&B
  - Step 5: Train and save to GCS/local

- **`requirements.txt`** - Python dependencies for training

### **GCP Files (Archived - Not Used for MVP)**
These were created for GCP Vertex AI but we're using Kaggle instead:
- `Dockerfile` - Container definition
- `cloudbuild.yaml` - Cloud Build config
- `submit_vertex_job.py` - Vertex AI job submission

**Why archived?** Kaggle is free ($0 vs $1-2/run), simpler, and equally effective for our use case.

## 🚀 Quick Start (Kaggle)

### **1. Upload Training Data**
Create a Kaggle dataset with `space_reasoning.jsonl` from the root directory.

### **2. Create Kaggle Notebook**
```python
# Install dependencies
!pip install -q transformers datasets peft bitsandbytes accelerate wandb

# Copy train_space_llm.py content or run directly
!python train_space_llm.py
```

### **3. Set Secrets**
In Kaggle notebook settings:
- `HUGGING_FACE_TOKEN` = Your HF token
- `WANDB_API_KEY` = Your W&B key

### **4. Enable GPU**
- Settings → Accelerator → GPU T4 x2 (or P100)
- Save & Run All

### **5. Download Adapters**
After training completes (~2-3 hours):
- `/kaggle/working/llama3-space-reasoning-final/`
- Download `adapter_config.json` and `adapter_model.safetensors`

## 📊 Training Config

```python
Model: meta-llama/Meta-Llama-3-8B
Method: LoRA (r=32, alpha=64)
Epochs: 5
Batch size: 16 (2 × 8 accumulation)
Learning rate: 1e-4 (cosine schedule)
Duration: ~2-3 hours on T4 GPU
Output: ~80MB LoRA adapters
```

## 🔧 Customization

**Increase training data:**
```python
# In train_space_llm.py, line 186
data_path = "gs://voyager-training-data/space_reasoning_5k.jsonl"  # More examples
```

**Adjust hyperparameters:**
```python
# Line 348-391 in train_space_llm.py
num_train_epochs = 5      # More epochs
learning_rate = 1e-4      # Higher/lower LR
per_device_train_batch_size = 2  # Reduce if OOM
```

## 📦 Deployment

After training, see `../docs/SPACE_REASONING_LLM_TRAINING.md` for:
1. Uploading to Hugging Face Hub
2. Using Inference API
3. Integrating into Voyager

## 🆘 Troubleshooting

**Out of Memory (OOM):**
- Reduce `per_device_train_batch_size` to 1
- Increase `gradient_accumulation_steps` to 16

**Loss not decreasing:**
- Check data format in `space_reasoning.jsonl`
- Verify JSONL has proper structure
- Try higher learning rate (2e-4)

**Training too slow:**
- Use P100 GPU instead of T4 (2x faster)
- Reduce `max_length` from 1024 to 512

## 📈 Monitoring

**Weights & Biases:**
- Dashboard: https://wandb.ai/
- Track: loss, learning rate, GPU usage
- Compare runs side-by-side

**Kaggle Logs:**
- Real-time training progress in notebook output
- GPU utilization in metrics panel

## 🎯 Success Criteria

After training, test with:
```python
prompt = "Calculate delta-v for Hohmann transfer from 400 km to 800 km altitude"
# Expected: Step-by-step solution with correct equations
```

Good output shows:
- ✅ "Step 1", "Step 2" formatting
- ✅ Correct equations (Hohmann transfer math)
- ✅ Numerical calculations
- ✅ Physical intuition

Bad output:
- ❌ Gibberish or repetition
- ❌ Wrong equations
- ❌ No step-by-step reasoning

---

**Questions?** See main docs in `../docs/SPACE_REASONING_LLM_TRAINING.md`
