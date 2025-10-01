Voyager LLM Implementation - Complete Guide
🎯 Project Context

What: Expand mars-mission-planner into Voyager - a general space exploration AI sidekick
Current State: Streamlit app using LangChain + GPT-4 for Mars questions
Goal: Switch to Claude API with abstraction layer, integrate SpaceML backend
🏗️ Architecture Decision

✅ SpaceML = Pure library (reusable space functionality)
✅ Voyager = Application (conversational interface)
✅ Relationship: Voyager uses SpaceML as backend dependency

voyager/                    # Application code (this is where we work)
├── app.py                 # Main Streamlit interface (your mars-mission-planner)
├── llm_provider.py        # LLM abstraction layer (we're building this)
├── voyager_brain.py       # Query parsing logic (we're building this)
├── requirements.txt       # Dependencies
└── .env                   # ANTHROPIC_API_KEY

spaceml/                    # Library code (stays pure, no UI/LLM)
├── navigation/            # Coordinate transforms (already built)
├── orbital/               # Orbital mechanics (future)
└── telemetry/             # Spacecraft health (future)

🎯 What We're Building

LLM abstraction layer for Voyager query parsing using Claude API.

Location: voyager/ project (NOT spaceml - this is application code)

Goal: Parse natural language queries to extract parameters for known modes.
🧠 Design Decisions
Why Claude over GPT-4:

    ✅ 3x cheaper ($3 vs $10 per million tokens)
    ✅ Better at following complex instructions
    ✅ More natural explanations
    ✅ Familiar API for you

Why Abstraction Layer:

    ✅ Easy to swap LLMs later
    ✅ Testable (mock provider for tests)
    ✅ Clean separation of concerns
    ✅ Can compare models side-by-side

Implementation Strategy:

    Start simple: User selects mode, LLM extracts parameters only
    Not doing yet: Automatic mode classification (too complex initially)
    Future: Train classifier on real user queries collected from simple version

📋 Implementation Steps

## ✅ Step 1: Create Base Interface - COMPLETED

File: voyager/llm_provider.py

Task: Create abstract base class for LLM providers

What was implemented:
- ✅ LLMProvider abstract class with complete() method
- ✅ Proper imports (ABC, abstractmethod, Optional)
- ✅ Type hints for all parameters and return values
- ✅ Professional docstrings (module, class, and method level)

Method signature:
```python
def complete(
    self,
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024
) -> str:
```

**Status**: Ready for Step 2!

---

## 🎯 Step 1 NEXT: Implement Claude Provider

Step 2: Implement Claude Provider

File: voyager/llm_provider.py

Task: Create ClaudeProvider class that implements the interface

What to implement:

    Class inherits from LLMProvider
    __init__ handles API key (from env or parameter)
    complete() method calls Claude API
    Proper error handling

Success criteria:

    Implements LLMProvider interface
    Handles API key securely
    Returns clean string response
    Handles errors gracefully

Questions to consider:

    How to handle missing API key?
    What exceptions might Claude API raise?
    Should we set default temperature?

Reference:
python

import anthropic
import os

class ClaudeProvider(LLMProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        # Your implementation...
    
    def complete(self, prompt: str, **kwargs) -> str:
        # Call Claude API
        # Handle errors
        # Return response

Step 3: Create Query Parser

File: voyager/voyager_brain.py

Task: Use LLM provider to extract parameters from natural language

What to implement:

    VoyagerBrain class that uses LLM provider
    Method to parse constellation queries
    Method to extract numeric parameters
    Returns structured data (dict/dataclass)

Success criteria:

    Takes natural language input
    Returns structured parameters
    Handles ambiguous queries
    Provides reasonable defaults

Example usage:
python

brain = VoyagerBrain(ClaudeProvider())
params = brain.parse_constellation_query(
    "Optimize 8 satellites for global coverage with redundancy"
)
# Returns: {"num_satellites": 8, "priority": "coverage", "redundancy": True}

Questions to consider:

    What prompt template to use?
    How to validate extracted parameters?
    What to do with malformed queries?

Step 4: Integrate with Streamlit

File: voyager/app.py (your current mars-mission-planner)

Task: Wire the LLM brain into the Streamlit interface

What to implement:

    Import VoyagerBrain and ClaudeProvider
    Replace LangChain calls with Voyager brain
    Parse user input through brain
    Display results naturally

Success criteria:

    User enters natural language query
    Parameters extracted automatically
    Results displayed clearly
    Graceful error handling

Questions to consider:

    Show extracted parameters to user?
    Allow manual parameter adjustment?
    How to handle API failures?

Step 5: Test Everything

File: voyager/tests/test_llm_provider.py

Task: Create comprehensive tests

What to test:

    Abstract interface compliance
    Claude provider with mock responses
    VoyagerBrain parameter extraction
    Error handling scenarios

Success criteria:

    All tests pass
    Edge cases covered
    Mock tests don't hit API
    Integration tests work

🔧 Dependencies to Add

File: voyager/requirements.txt
txt

streamlit
anthropic
python-dotenv

Environment setup:
bash

# Create .env file
echo "ANTHROPIC_API_KEY=your-key-here" > voyager/.env

# Install dependencies
cd voyager
pip install -r requirements.txt

📁 Complete Project Structure

voyager/                          # Your application
├── app.py                        # Main Streamlit interface
├── llm_provider.py              # ← Step 1 & 2: LLM abstraction
├── voyager_brain.py             # ← Step 3: Query parsing
├── tests/
│   └── test_llm_provider.py    # ← Step 5: Tests
├── requirements.txt             # Dependencies
├── .env                         # API keys (gitignored)
└── README.md                    # Usage instructions

spaceml/                          # Your library (stays pure)
├── navigation/                   # Coordinate transforms (already built)
├── orbital/                      # Future: orbital mechanics
└── (no LLM code here)           # This is application logic

🎓 Learning Approach: Guided Practice
How to Use This Plan:

Browser (Design & Review):

    Understand the architecture
    Ask clarifying questions
    Review completed code
    Plan next features

Console with Claude Code (Implementation):

    Reference this document
    Implement step by step
    Test as you go
    Commit working code

Workflow:

    Read a step completely
    Think about the questions
    Implement in console
    Test your implementation
    Come back to browser for review

What to Ask Claude Code:

    "Guide me through implementing Step 1"
    "I'm stuck on error handling, help me debug"
    "Review my implementation of the abstract class"

What to Report Back Here:

    What you implemented
    What worked well
    Questions or concerns
    Code snippet of main interface

Then return to browser for:

    Code review
    Feedback on approach
    Planning next feature (parameter extraction)

💡 Tips

    Start with Step 1, get it working before Step 2
    Test each step before moving on
    Commit after each working step
    Ask Claude Code questions if stuck
    Don't worry about perfect - focus on working

🚀 Quick Start Commands
bash

# Setup
cd ~/projects/voyager
touch llm_provider.py voyager_brain.py
echo "ANTHROPIC_API_KEY=sk-xxx" > .env

# Open Claude Code
# Reference this document
# Start with Step 1

# Test as you build
python -m pytest tests/

# Run the app
streamlit run app.py

Remember: This is YOUR implementation. Claude Code is your guide, not your ghost writer! 🚀

Let's build this step by step!
