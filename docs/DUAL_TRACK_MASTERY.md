# Dual-Track Mastery: Tensor Temple + Build Lab

## 🎯 Core Philosophy
Learn transformer internals (theory) while fine-tuning LLaMA 3 (practice). Each track reinforces the other.

---

## 📋 Daily Workflow

### Morning Session (30-45 min) - TENSOR TEMPLE
**Location**: Browser with artifact
**Goal**: Understand one transformer component deeply

**Pattern**:
1. Read concept + math (5 min)
2. Study code with dimensions (10 min)
3. Copy to notebook, run it (15 min)
4. Complete challenge (10 min)
5. Note questions for evening

### Evening Session (60-90 min) - BUILD LAB
**Location**: Terminal with Claude Code
**Goal**: Apply learning to real LLaMA 3 fine-tuning

**Pattern**:
1. Create context file from morning learning (5 min)
2. Implement/test related component (45 min)
3. Connect theory to practice (10 min)
4. Document progress (5 min)

---

## 🔗 Module Connection Map

### **Module 1: Self-Attention** → Check LLaMA's Q, K, V projections
```python
# Build Lab Code:
from transformers import LlamaConfig
config = LlamaConfig.from_pretrained("meta-llama/Meta-Llama-3-8B")
print(f"Hidden size: {config.hidden_size}")  # 4096
print(f"Num heads: {config.num_attention_heads}")  # 32
print(f"Head dim: {config.hidden_size // config.num_attention_heads}")  # 128
```

### **Module 2: Multi-Head Attention** → Inspect actual attention layers
```python
# Build Lab Code:
model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B")
layer = model.model.layers[0].self_attn
print(layer)  # See q_proj, k_proj, v_proj, o_proj
```

### **Module 3: Feed-Forward** → Check FFN architecture
```python
# Build Lab Code:
layer = model.model.layers[0].mlp
print(f"Gate proj: {layer.gate_proj}")  # Expansion
print(f"Down proj: {layer.down_proj}")  # Compression
# LLaMA uses SwiGLU instead of ReLU!
```

### **Module 4: Complete Layer** → Apply LoRA to full layer
```python
# Build Lab Code:
lora_config = LoraConfig(
    r=16,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj",  # Attention
                    "gate_proj", "up_proj", "down_proj"]      # FFN
)
```

### **Module 5: Full LLM** → Train complete model
```python
# Build Lab Code:
# Now you understand every parameter being updated!
trainer.train()  # All 5 modules working together
```

---

## 📅 Week 1 Schedule

| Day | Morning (Temple) | Evening (Lab) | Connection Point |
|-----|------------------|---------------|------------------|
| Mon | Module 1: Self-Attention | Setup + GPU test | Understand Q, K, V matrices |
| Tue | Module 2: Multi-Head | Data prep + tokenization | See 32 heads in LLaMA |
| Wed | Module 3: FFN | First training test (100 steps) | FFN parameters in model |
| Thu | Module 4: Complete Layer | Monitor training, tune hyperparams | Residuals + LayerNorm in action |
| Fri | Module 5: Full LLM | Full 3-epoch training | Stack of 32 layers processing |
| Sat | Review + Experiment | Generate NASA reports | Theory → Working model |
| Sun | Rest / Optional deep dive | Evaluate model quality | Reflection |

---

## 🎯 Session Start Template

**Copy this at start of each Build Lab session:**

```markdown
BUILD LAB SESSION - Day [X]

CONTEXT FROM TENSOR TEMPLE:
- Module: [Name]
- Key Learning: [One sentence]
- Questions: [1-3 specific questions]

TODAY'S GOAL:
- [ ] [Specific task]
- [ ] [Connection to morning learning]
- [ ] [Test/verification]

SUCCESS CRITERIA:
- Working code
- Understand connection to theory
- Ready for next module
```

---

## 🔧 Claude Code Prompt Templates

### **When starting session:**
```
I just completed Tensor Temple Module [X] on [Topic].

Key concepts: [List 2-3]
Questions: [List questions]

Help me apply this to fine-tuning LLaMA 3:
1. Show me where this appears in LLaMA architecture
2. Guide implementation of [specific task]
3. Connect theory to what we're building
```

### **When stuck:**
```
Working on [task] from Module [X].

What's happening: [describe]
Expected: [what should happen]
Actual: [what's happening]

Theory from this morning: [concept]
How does this connect?
```

### **End of session:**
```
Today I:
- [Completed task]
- [Learned connection]
- [Question still unclear]

Next session: [clear next step]
Ready to document progress.
```

---

## 📊 Progress Tracking

### **Week 1 Goals:**
- [ ] All 5 Tensor Temple modules completed
- [ ] LLaMA 3 8B fine-tuned on NASA data
- [ ] Can explain every component
- [ ] Generated coherent NASA-style text
- [ ] Understand LoRA target selection

### **Success Indicators:**
✅ Can modify LoRA config intelligently
✅ Know what each layer does during training
✅ Understand loss curves
✅ Can debug training issues
✅ Ready for advanced topics

---

## 🚨 Common Pitfalls to Avoid

**DON'T:**
- ❌ Rush through Tensor Temple without understanding
- ❌ Skip challenges (they test understanding)
- ❌ Train without connecting to theory
- ❌ Move forward with confusion
- ❌ Forget to document connections

**DO:**
- ✅ Take time with math and dimensions
- ✅ Run code and modify parameters
- ✅ Ask questions when unclear
- ✅ Connect each Build Lab task to Temple module
- ✅ Document "aha moments"

---

## 💡 Key Connections to Internalize

1. **LoRA rank (r=16)** → Low-rank decomposition from Module 1 math
2. **target_modules** → Specific projections learned in Modules 1-3
3. **d_model=4096** → Hidden dimension throughout all modules
4. **num_heads=32** → Multi-head parallel processing from Module 2
5. **Loss decreasing** → Backprop through all 5 module components

---

## 🎓 End of Week Checkpoint

**Questions to answer:**

**Theoretical:**
- How does self-attention compute which words to focus on?
- Why do we need multiple attention heads?
- What's the purpose of the FFN after attention?
- Why are residual connections critical?
- How does a transformer become a language model?

**Practical:**
- What layers did you apply LoRA to and why?
- How did you choose rank (r)?
- What was your learning rate and why?
- How do you know the model is learning?
- Can you generate coherent NASA text?

**Synthesis:**
- When you see "loss=1.2", what's happening in the transformer?
- If training diverges, where would you look first?
- How would you explain transformers to another engineer?

---

## 🚀 After Week 1: Next Steps

**Advanced Topics:**
- Rotary Position Embeddings (RoPE) in LLaMA
- Grouped Query Attention (GQA)
- SwiGLU activation (vs ReLU)
- KV caching for inference
- Quantization (4-bit, 8-bit)

**Extended Projects:**
- Deploy model with FastAPI
- A/B test against base LLaMA
- Fine-tune for specific NASA missions
- Multi-task learning
- RLHF alignment

---

## 📝 Quick Reference

**Tensor Temple Artifact**: Browser
**Build Lab**: Terminal with Claude Code
**Documentation**: This file + session logs
**Monitoring**: Weights & Biases / TensorBoard

**Key Files**:
- `train_llama.py` - Main training script
- `lora_config.py` - LoRA configuration
- `generate.py` - Test generation
- `session_logs/` - Daily progress notes

---

*This document guides the parallel learning journey. Reference it daily to maintain connection between theory and practice.*