# Claude Code Coaching Guide - Mars Mission Planner

## 🎯 Project Context
Building an LLM-powered Mars mission planning assistant to demonstrate AI engineering skills for space industry roles. This is a portfolio project with strict time constraints (90-120 min/day) focused on learning production LLM deployment.

## 🏗️ Current Architecture
```
User Input → Streamlit Chat UI → OpenAI GPT-3.5-turbo → Mars Mission Expert Responses
                ↓
            Session State Memory ← Full Conversation History
```

**What's Built**:
- Streamlit chat interface with proper message bubbles
- OpenAI integration with enhanced Mars mission system prompt
- Conversation memory using st.session_state
- Professional UX with instant message display

## 📋 Development Phases

### ✅ Phase 1: Basic Chatbot (Days 1-2) - COMPLETED
- Working Streamlit app with basic UI
- Text input/output functionality
- Ready for AI integration

### ✅ Phase 2: AI Integration (Days 3-4) - COMPLETED
**Goal**: Add OpenAI + conversation memory
**Time Budget**: 120 minutes total - ACHIEVED

**Session 2 Achievements** (90 min):
✅ OpenAI API integration working
✅ Conversation memory implemented with session_state
✅ Professional chat interface with message bubbles
✅ Multi-turn conversations tested and working
✅ Enhanced system prompt for Mars mission expertise

### 🎯 Phase 3: Containerization & Deployment (Days 5-7) - CURRENT FOCUS
**Goal**: Production-ready containerized application
**Priority**: Docker containerization (user's main interest)

**Next Session Tasks**:
- Create Dockerfile for the application
- Handle environment variables in containers
- Test local Docker container
- Prepare for cloud deployment

### 🔧 Phase 4: Advanced Features (Days 8+) - FUTURE
**Goal**: LangChain integration and tool calling
**Focus**: Add specialized Mars mission calculations

**Phase 4 Tasks**:
- Add LangChain agent setup
- Create tool functions (delta-v calculations, mission planning)
- Implement tool calling pattern
- Test: "What's the delta-v to Mars?" returns calculated answer

## 🛠️ Technical Requirements

### Current Dependencies
```
streamlit>=1.28.0
openai>=1.0.0
python-dotenv>=1.0.0
```

### Phase 4 Dependencies (Future)
```
langchain>=0.1.0
langchain-openai>=0.0.2
numpy>=1.24.0
```

## 📁 Current File Structure
```
mars-mission-planner/
├── app.py                 # ✅ Main Streamlit application
├── .env                   # ✅ API keys (not in git)
├── environment.yml        # ✅ Conda environment
├── CLAUDE.md             # ✅ This coaching guide
└── (Phase 3) Dockerfile   # 🎯 Next: Container definition
└── (Phase 3) requirements.txt # 🎯 Next: Python dependencies
└── (Phase 4) agent.py     # 🔮 Future: LangChain agent
└── (Phase 4) tools/       # 🔮 Future: Calculation functions
```

## 🎯 Success Criteria

### ✅ Phase 2 Achievement (AI Integration):
```
User: "Hello, I want to plan a Mars mission"
Bot: "Great! I can help you plan Mars missions. What specific aspects would you like to explore - launch windows, trajectory requirements, or mission duration?"
User: "What about trajectory requirements?"
Bot: [Remembers context] "For Mars trajectories, the key requirement is delta-v..."
```

### Phase 3 Target (Docker Deployment):
```
$ docker build -t mars-mission-planner .
$ docker run -p 8501:8501 mars-mission-planner
→ App running in container, accessible at localhost:8501
```

### Phase 4 Target (Tool Calling):
```
User: "What's the delta-v needed to get to Mars?"
Bot: "Let me calculate that for you..." [calls function]
     "A Hohmann transfer to Mars requires approximately 3.6 km/s delta-v from Earth orbit."
```

## 🔧 Common Implementation Patterns

### Streamlit Chat Interface Pattern:
```python
# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Handle new input
if prompt := st.chat_input("Ask about Mars missions..."):
    # Add user message and get AI response
```

### LangChain Tool Function Pattern:
```python
from langchain.tools import tool

@tool
def calculate_delta_v_to_mars() -> str:
    """Calculate delta-v requirement for Mars transfer."""
    # Simple Hohmann transfer calculation
    delta_v = 3.6  # km/s
    return f"Mars transfer requires {delta_v} km/s delta-v"
```

## 📚 Key Learning Resources

### Essential Docs (5-10 min reads):
- **Streamlit Chat**: https://docs.streamlit.io/library/api-reference/chat
- **LangChain Tools**: https://python.langchain.com/docs/modules/agents/tools/
- **OpenAI Function Calling**: https://platform.openai.com/docs/guides/function-calling

### Quick References:
- **Earth to Mars delta-v**: ~3.6 km/s (Hohmann transfer)
- **Earth escape velocity**: 11.2 km/s  
- **Conversation memory**: Use `st.session_state` for persistence

## 🆘 Troubleshooting Guide

### ✅ Phase 2 Resolved Issues:
**"OpenAI API key not found"**
- ✅ Solved: `.env` file created with `OPENAI_API_KEY`
- ✅ Solved: `python-dotenv` properly loading with `load_dotenv()`

**"Chat messages not persisting"**
- ✅ Solved: `st.session_state.messages` initialization working
- ✅ Solved: Messages properly appended and displayed

### Phase 3 Docker Issues:
**"Container won't build"**
- Check Dockerfile syntax
- Verify requirements.txt includes all dependencies
- Ensure Python base image compatibility

**"Environment variables in container"**
- Use Docker secrets or build-time args
- Never include .env in Docker image
- Set up proper env var injection

### Phase 4 Future Issues:
**"Tool function not being called"**
- Verify tool decorator: `@tool`
- Check function docstring format
- Test agent initialization

## 🎬 Demo Scenarios

### ✅ Phase 2 Demo (Working):
1. Start conversation: "Hi, I need help planning a Mars mission"
2. Show memory: Ask follow-up questions
3. Demonstrate context: "What did I just ask about?"
4. Professional chat interface with message bubbles

### Phase 3 Demo (Docker):
1. Build container: `docker build -t mars-mission-planner .`
2. Run container: `docker run -p 8501:8501 mars-mission-planner`
3. Test app works identically in container
4. Demonstrate portability across environments

### Phase 4 Demo (Tools):
1. Ask calculation: "What's the delta-v to Mars?"
2. Show real math: Bot performs calculation
3. Test follow-up: "How does that compare to the Moon?"

## 📊 Progress Tracking

### Completed:
- [x] Basic Streamlit app setup
- [x] Project structure created (app.py, .env, CLAUDE.md)
- [x] Development environment configured
- [x] Conda environment with all dependencies

### Phase 2 Completed:
- [X] OpenAI integration working
- [X] Conversation memory implemented
- [X] Chat interface functional
- [X] Multi-turn conversations tested
- [X] Enhanced Mars mission system prompt

### Phase 3 Goals (Next Session):
- [ ] Dockerfile created and working
- [ ] Environment variables handled in container
- [ ] Local Docker testing successful
- [ ] App ready for cloud deployment

### Phase 4 Goals (Future):
- [ ] LangChain agent configured
- [ ] First tool function created
- [ ] Tool calling pattern working
- [ ] Mars delta-v calculation functional

## 🚀 Coaching Notes for Claude Code

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

**Current Phase**: Containerising the current app for deployment
**Next Milestone**: working docker image, containerised app ready for deployment
**Time Budget Remaining**: ~4 hours over 5 days
**Portfolio Goal**: Deployed LLM application demonstrating production skills