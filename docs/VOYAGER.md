# Voyager - Space Mission AI Assistant

## 🤖 Coaching Instructions for Claude Code

**Role**: Act as Isaac's collaborative coding partner, technical mentor, and awesome AI partner-in-crime (like Jarvis from Iron Man)

**Coaching Style**:
- **Explain concepts**: Before implementing, explain what we're about to do and why
- **Pair programming**: Guide Isaac through new technologies step-by-step, letting him drive when learning
- **Ask before acting**: When introducing new concepts, ask "Would you like me to explain X first?" or "Shall we walk through this together?"
- **Teaching moments**: Use each implementation as a learning opportunity - explain patterns, best practices, and alternatives
- **Collaborative**: Say "Let's..." instead of "I'll..." - we're working together
- **Patient**: Break complex concepts into digestible pieces
- **Context-aware**: Remember Isaac is learning LangChain, fine-tuning, and production deployment patterns

**When to coach vs. when to code**:
- 🎓 **Coach first**: New frameworks (LangChain), complex concepts (agents, tools), architectural decisions
- ⚡ **Code directly**: Routine tasks, bug fixes, file organization, dependency management
- 🤝 **Pair program**: Implementing new patterns Isaac wants to learn hands-on

**Communication style**: Like a best friend or big brother teaching a new skill you're super excited about

---

## 🎯 Project Vision

**What**: Voyager - A general space exploration AI sidekick powered by Claude
**Origin**: Started as mars-mission-planner, expanding to comprehensive space mission assistant
**Goal**: Portfolio project demonstrating production LLM deployment + custom model training for space industry roles
**Time Constraints**: 90-120 min/day sessions

### Current Architecture
```
User Input → Streamlit Chat UI → LLM Provider (Abstraction Layer)
                ↓                        ↓
            Session State         Claude API / OpenAI
                ↓
          LangChain Agent → Mars Mission Tools
                ↓
          Space Calculations (delta-v, trajectories, launch windows)
```

---

## 📊 Current Status

### ✅ Completed
- [x] Basic Streamlit chat interface with message bubbles
- [x] OpenAI integration with conversation memory
- [x] LangChain agent with Mars mission tool calling
- [x] Tools: delta-v calculator, mission duration, launch windows
- [x] **LLM Provider abstraction layer (Step 1 complete)**

### 🎯 Current Focus: Step 2 - Claude Provider Implementation
**Location**: `llm_provider.py`

**What's Next**:
1. Implement ClaudeProvider class using Anthropic API
2. Test abstraction layer with Claude
3. Create VoyagerBrain query parser
4. Integrate with Streamlit app

### Future Phases
- [ ] Docker containerization & deployment
- [ ] SpaceML library integration (coordinate transforms)
- [ ] Expand from Mars-only to general space missions
- [ ] Fine-tune custom space-domain model (Mistral 7B / Llama 3.1 8B)

---

## 🏗️ Technical Implementation Guide

### Architecture Decision

**Voyager** = Application (conversational interface)
**SpaceML** = Pure library (reusable space functionality)
**Relationship**: Voyager uses SpaceML as backend dependency

```
voyager/                    # Application code (where we work)
├── app.py                 # Main Streamlit interface
├── llm_provider.py        # ✅ LLM abstraction layer (Step 1 done)
├── voyager_brain.py       # 🎯 Query parsing logic (Step 3)
├── tools.py               # LangChain Mars mission tools
├── requirements.txt       # Dependencies
└── .env                   # ANTHROPIC_API_KEY, OPENAI_API_KEY

spaceml/                    # Library code (stays pure, no UI/LLM)
├── navigation/            # Coordinate transforms (future)
├── orbital/               # Orbital mechanics (future)
└── telemetry/             # Spacecraft health (future)
```

### Why Claude over GPT-4?
- ✅ 3x cheaper ($3 vs $10 per million tokens)
- ✅ Better at following complex instructions
- ✅ More natural explanations
- ✅ Familiar API for Isaac

### Why Abstraction Layer?
- ✅ Easy to swap LLMs later
- ✅ Testable (mock provider for tests)
- ✅ Clean separation of concerns
- ✅ Can compare models side-by-side

---

## 📋 Implementation Steps

### ✅ Step 1: Create Base Interface - COMPLETED

**File**: `llm_provider.py`

**Implemented**:
- ✅ `LLMProvider` abstract class with `complete()` method
- ✅ Proper imports (ABC, abstractmethod, Optional)
- ✅ Type hints for all parameters and return values
- ✅ Professional docstrings

**Method signature**:
```python
def complete(
    self,
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024
) -> str:
```

---

### 🎯 Step 2: Implement Claude Provider - CURRENT

**File**: `llm_provider.py`

**Task**: Create `ClaudeProvider` class that implements the interface

**What to implement**:
- Class inherits from `LLMProvider`
- `__init__` handles API key (from env or parameter)
- `complete()` method calls Claude API
- Proper error handling

**Success criteria**:
- Implements `LLMProvider` interface
- Handles API key securely
- Returns clean string response
- Handles errors gracefully

**Reference implementation**:
```python
import anthropic
import os

class ClaudeProvider(LLMProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found")
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def complete(self, prompt: str, **kwargs) -> str:
        # Call Claude API
        # Handle errors
        # Return response
```

**Questions to consider**:
- How to handle missing API key?
- What exceptions might Claude API raise?
- Should we set default temperature?

---

### 🔮 Step 3: Create Query Parser - FUTURE

**File**: `voyager_brain.py`

**Task**: Use LLM provider to extract parameters from natural language

**What to implement**:
- `VoyagerBrain` class that uses LLM provider
- Method to parse constellation queries
- Method to extract numeric parameters
- Returns structured data (dict/dataclass)

**Example usage**:
```python
brain = VoyagerBrain(ClaudeProvider())
params = brain.parse_constellation_query(
    "Optimize 8 satellites for global coverage with redundancy"
)
# Returns: {"num_satellites": 8, "priority": "coverage", "redundancy": True}
```

---

### 🔮 Step 4: Integrate with Streamlit - FUTURE

**File**: `app.py`

**Task**: Wire the LLM brain into the Streamlit interface

**What to implement**:
- Import `VoyagerBrain` and `ClaudeProvider`
- Replace LangChain calls with Voyager brain
- Parse user input through brain
- Display results naturally

**Questions to consider**:
- Show extracted parameters to user?
- Allow manual parameter adjustment?
- How to handle API failures?

---

### 🔮 Step 5: Test Everything - FUTURE

**File**: `tests/test_llm_provider.py`

**What to test**:
- Abstract interface compliance
- Claude provider with mock responses
- VoyagerBrain parameter extraction
- Error handling scenarios

---

## 🛠️ Current Dependencies

**File**: `environment.yml` (conda environment: `voyager`)

```yaml
dependencies:
  - python=3.11
  - pip
  - pip:
    - streamlit>=1.28.0
    - openai>=1.0.0
    - anthropic
    - langchain>=0.1.0
    - langchain-openai>=0.0.2
    - python-dotenv>=1.0.0
    - numpy>=1.24.0
```

**Environment Setup**:
```bash
# Create .env file
echo "ANTHROPIC_API_KEY=your-key-here" >> .env
echo "OPENAI_API_KEY=your-key-here" >> .env

# Activate environment
conda activate voyager
```

---

## 🎯 Success Criteria

### Current Phase (LLM Abstraction):
- [x] Abstract `LLMProvider` interface created
- [ ] `ClaudeProvider` working with Anthropic API
- [ ] Can swap between Claude and OpenAI seamlessly
- [ ] Query parsing extracting structured parameters

### Deployment Phase (Future):
```bash
$ docker build -t voyager .
$ docker run -p 8501:8501 voyager
→ App running in container, accessible at localhost:8501
```

### Tool Calling Demo (Working):
```
User: "What's the delta-v needed to get to Mars?"
Bot: "Let me calculate that for you..." [calls function]
     "A Hohmann transfer to Mars requires approximately 3.6 km/s delta-v from Earth orbit."
```

---

## 🔧 Common Implementation Patterns

### Streamlit Chat Interface:
```python
# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Handle new input
if prompt := st.chat_input("Ask about space missions..."):
    # Add user message and get AI response
```

### LangChain Tool Function:
```python
from langchain.tools import tool

@tool
def calculate_delta_v_to_mars() -> str:
    """Calculate delta-v requirement for Mars transfer."""
    delta_v = 3.6  # km/s (Hohmann transfer)
    return f"Mars transfer requires {delta_v} km/s delta-v"
```

---

## 📚 Key Learning Resources

### Essential Docs (5-10 min reads):
- **Streamlit Chat**: https://docs.streamlit.io/library/api-reference/chat
- **LangChain Tools**: https://python.langchain.com/docs/modules/agents/tools/
- **Anthropic API**: https://docs.anthropic.com/claude/reference/getting-started
- **OpenAI Function Calling**: https://platform.openai.com/docs/guides/function-calling

### Quick References:
- **Earth to Mars delta-v**: ~3.6 km/s (Hohmann transfer)
- **Earth escape velocity**: 11.2 km/s
- **Conversation memory**: Use `st.session_state` for persistence

---

## 🎨 Voyager Interface Design System

### 🛸 Voyager Identity

**Name:** Voyager
**Tagline:** "Chart your course through the cosmos"
**Purpose:** Conversational interface for SpaceML library operations

**Visual Theme:**
- **Primary:** Deep space black (#0B0C10)
- **Accent:** Golden record gold (#D4AF37)
- **Secondary:** Nebula purple (#5C4B8B), Cosmic blue (#1E3A5F)
- **Text:** Starlight white (#E8E9EB)
- **Typography:** Orbitron (headers), Inter (body)

**Design Philosophy:**
- **Minimalist:** One primary focus (hero visualization), everything else hidden in expanders
- **Progressive Disclosure:** Complexity available but not visible until needed
- **Visual Hierarchy:** The visualization is always the star
- **Consistent Aesthetic:** Same Voyager theme across all modes

### 📐 Current Implementation

**Working Features:**
- ✅ Satellite constellation optimization with 3D visualization
- ✅ Multi-constraint optimization (efficiency, redundancy, communication)
- ✅ Penalty-based constraint matrices
- ✅ Lat/lon to Cartesian conversion
- ✅ Clean class-based architecture

**Current Interface Structure:**
```
Voyager Header (centered, minimal)
    ↓
3D Satellite Visualization (hero, 2/3 width)
    ↓
Control Panel (1/3 width, expanders)
    - Optimization Goals (weights)
    - Constellation Setup (num satellites)
    - Action Button (Optimize)
```

### 🚀 Multi-Mode Expansion Plan

**Target Modes:**
1. **Constellation Optimization** (current) - 3D satellite placement
2. **Trajectory Planning** - Hohmann transfers, porkchop plots
3. **Delta-V Calculation** - Mission phase budgets
4. **Navigation Queries** - Coordinate transformations
5. **Mission Duration** - Launch windows, transfer times

**Architecture Pattern:**
```python
class VoyagerInterface:
    """Consistent shell, swappable content modules."""

    def __init__(self):
        self.set_voyager_theme()  # Always same
        self.display_header()     # Always same

    def show_mode(self, mode, config):
        # Hero viz changes based on mode
        # Controls adapt to mode
        # Action button behavior changes
        # But aesthetic stays consistent
```

### 🎨 Interface Components

**Fixed Elements (Always Present):**
- Voyager header with branding
- Deep space themed background
- Golden accent styling on interactive elements
- Clean typography hierarchy
- Hidden Streamlit branding

**Adaptive Elements (Change Per Mode):**

**Hero Visualization:**
- Satellites: 3D sphere with golden satellites
- Trajectory: 2D orbital transfer plot
- Delta-V: Bar chart budget breakdown
- Navigation: Coordinate frame diagrams

**Control Panel:**
- Different expanders per mode
- Mode-specific sliders/inputs
- Contextual help text

**Action Button:**
- "Optimize Constellation" for satellites
- "Calculate Transfer" for trajectory
- "Compute Budget" for delta-v

**Results Display:**
- Natural language explanations
- Mode-specific metrics
- Follow-up action suggestions

### 🔧 Mode Implementation Pattern

**Code Structure:**
```python
# Composition over inheritance
class VoyagerMode:
    """Base protocol for Voyager modes."""
    def create_visualization(self, data): ...
    def get_controls(self): ...
    def process_action(self, inputs): ...

class ConstellationMode(VoyagerMode): ...
class TrajectoryMode(VoyagerMode): ...
```

**Streamlit Integration:**
```python
# Main app
def voyager_app():
    interface = VoyagerInterface()

    # Detect or select mode
    mode = detect_mode(user_input)

    # Display appropriate content
    interface.show_mode(mode, config)
```

### 💡 Design Decisions

**Mode Selection:**
- **Option A:** Natural language query parsing ("Optimize 5 satellites...")
- **Option B:** Minimal mode selector tabs at top
- **Option C:** Conversational chat interface with auto-detection
- **Current Plan:** Start with B (explicit), add A/C later

**State Management:**
- Track current mode
- Remember user preferences per mode
- Cache optimization results
- Handle mode switching without losing work

**Extensibility:**
- New modes should be plug-and-play
- SpaceML library integration should be clean
- Each mode should work independently

### 🌟 Interface Success Criteria

- ✅ All modes share consistent Voyager aesthetic
- ✅ Interface stays minimalist regardless of mode
- ✅ Easy to add new modes without refactoring
- ✅ Each mode showcases different SpaceML capabilities
- ✅ User can switch modes without cognitive overhead
- ✅ The visualization is always the hero

---

## 🚀 Future Extensions

### Phase 1: SpaceML Integration (Sessions 4-5)
**Goal**: Integrate SpaceML library and broaden mission scope

**Key Changes**:
- Update system prompt: Mars-specific → General space exploration
- Integrate coordinate transform class from SpaceML
- Add satellite constellation optimization tools
- Update UI: "Mars Mission Planning" → "Space Mission Assistant"

**New Tools to Build**:
```python
@tool
def coordinate_transform(from_frame: str, to_frame: str, coordinates: str) -> str:
    """Transform coordinates between reference frames (ECI, ECEF, etc.)"""

@tool
def optimize_constellation(satellites: int, coverage: str, orbit_type: str) -> str:
    """Optimize satellite constellation for given coverage requirements"""
```

### Phase 2: Fine-tuned Model (Weeks 3-5)
**Goal**: Fine-tune domain-specific model for space mission planning

**Technical Approach**:
- Base model: Mistral 7B or Llama 3.1 8B
- Method: LoRA/QLoRA fine-tuning (efficient, consumer GPU friendly)
- Training data: NASA technical reports, mission transcripts, orbital mechanics texts
- Evaluation: Benchmark against GPT-4 on space-specific questions

**Training Data Sources**:
- NASA Technical Reports Server: https://ntrs.nasa.gov/
- Apollo mission transcripts and communications
- Orbital mechanics textbooks and papers
- Space mission planning documentation
- Voyager conversation logs (synthetic data)

**Tools & Frameworks**:
- Hugging Face Transformers + PEFT for LoRA
- Weights & Biases for experiment tracking
- vLLM for efficient inference
- DeepSpeed/FSDP for training optimization

**Portfolio Value**:
"Fine-tuned 7B model to match GPT-4 performance on aerospace engineering tasks while enabling on-premises deployment for mission-critical systems"

**Time Investment**: 2-3 weeks (6-9 sessions at 90-120 min each)

### Phase 3: Advanced ML Extensions (Future)

**Option A: Trajectory Prediction Neural Network**
- Train neural network to predict optimal trajectories without physics calculations
- 1000x faster than traditional physics simulations
- Enables real-time trajectory optimization

**Option B: Multimodal Landing Site Analysis**
- Fine-tune vision model for Mars/Moon terrain analysis
- Combines computer vision + LLM chat interface
- Direct application to autonomous landing systems
- Uses real NASA/ESA satellite imagery

---

## 🎯 Strategic Rationale

### Why Fine-tuning After Deployment?
1. **Industry Alignment**: Space companies need on-prem AI (no data to OpenAI)
2. **Cost Efficiency**: Smaller models, no API costs at scale
3. **Learning Path**: Natural progression from API → custom models
4. **Reusability**: Fine-tuned model useful across multiple space projects
5. **Differentiation**: Few candidates combine LLM deployment + custom training

### Career Positioning Impact
- **After Current Phase**: "I deploy production LLM applications with abstraction layers"
- **After Fine-tuning**: "I fine-tune domain-specific models for specialized applications"
- **Combined Story**: "End-to-end AI engineer from API integration to custom model training"

---

## 🆘 Troubleshooting Guide

### LLM Provider Issues:
**"API key not found"**
- Check `.env` file exists with `ANTHROPIC_API_KEY`
- Verify `python-dotenv` is installed and `load_dotenv()` called
- Check environment variable: `echo $ANTHROPIC_API_KEY`

**"Abstract class cannot be instantiated"**
- You're trying to use `LLMProvider()` directly
- Use concrete implementation: `ClaudeProvider()` or `OpenAIProvider()`

**"Rate limit exceeded"**
- Add retry logic with exponential backoff
- Consider caching responses for repeated queries
- Monitor usage in Anthropic dashboard

### Tool Calling Issues:
**"Tool function not being called"**
- Verify tool decorator: `@tool`
- Check function docstring format (must be descriptive)
- Test agent initialization
- Print agent's available tools for debugging

---

## 🎬 Demo Scenarios

### Current Demo (LangChain + Tools):
1. Start conversation: "Hi, I need help planning a Mars mission"
2. Ask calculation: "What's the delta-v to Mars?"
3. Show tool calling: Bot performs calculation
4. Test follow-up: "How long will the journey take?"

### Future Demo (Claude Integration):
1. Same queries, but powered by Claude API
2. Show cost comparison in terminal
3. Demonstrate swapping providers on the fly
4. Compare response quality between models

### Future Demo (Fine-tuned Model):
1. Compare responses: GPT-4 vs Claude vs fine-tuned model
2. Show cost/latency improvements
3. Demonstrate offline operation capability
4. Technical deep-dive on space domain accuracy

---

## 💡 Coaching Notes for Claude Code

### Development Style:
- **Time-constrained**: 90-120 min sessions, must be efficient
- **Learning-focused**: Explain patterns while implementing
- **Portfolio-driven**: Code must be demo-ready, not just functional
- **Incremental**: Build one feature at a time, test immediately

### Error Handling Philosophy:
- Get basic functionality working first
- Add error handling in polish phase
- Focus on happy path scenarios initially
- Production concerns come after core features

### Code Quality Standards:
- Clean, readable code suitable for portfolio
- Proper imports and structure
- Comments explaining space domain concepts
- Professional variable naming

### Success Metrics:
- Each session produces working, testable functionality
- Code is suitable for technical interview discussion
- Application demonstrates real AI engineering skills
- Project differentiates from generic chatbot tutorials

---

## 🚀 Quick Start Commands

```bash
# Activate environment
conda activate voyager

# Run the app
streamlit run app.py

# Test implementation
python -m pytest tests/

# Check environment
pip list | grep -E "streamlit|openai|langchain|anthropic"
```

---

**Current Status**: Step 1 complete, implementing Step 2 (Claude Provider)
**Next Milestone**: LLM abstraction layer fully functional with Claude
**Long-term Goal**: Complete AI engineering portfolio (deployment + training)
**Time Horizon**: 6 weeks for deployment + fine-tuning phases
