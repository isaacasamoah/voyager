# Voyager
**Chart your course through the cosmos**

AI-powered space mission planning assistant that combines conversational interfaces with specialized orbital mechanics tools.

## 🚀 Features

- **Mars Mission Planning**: Calculate delta-v requirements, mission durations, and launch windows
- **LangChain Tool Calling**: Specialized orbital mechanics calculations powered by LLM agents
- **LLM Provider Abstraction**: Swap between OpenAI and Claude (Anthropic) seamlessly
- **Beautiful UI**: Clean Streamlit interface for natural language mission planning

## 📦 Installation

### Prerequisites
- Python 3.11+
- Conda (recommended) or pip

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/isaacasamoah/voyager.git
cd voyager
```

2. **Create conda environment**
```bash
conda env create -f environment.yml
conda activate voyager
```

Or with pip:
```bash
pip install -r requirements.txt
```

3. **Configure API keys**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

## 🎯 Quick Start

```bash
# Activate environment
conda activate voyager

# Run the app
streamlit run src/app.py
```

Navigate to `http://localhost:8501` and start planning your Mars mission!

## 🏗️ Project Structure

```
voyager/
├── src/                           # Source code
│   ├── app.py                     # Main Streamlit application
│   ├── llm/                       # LLM provider abstraction
│   │   └── providers.py           # Abstract LLM interface
│   └── tools/                     # LangChain tools
│       └── mars_mission.py        # Mars mission calculations
├── tests/                         # Test suite
├── docs/                          # Documentation
├── requirements.txt               # Python dependencies
├── environment.yml                # Conda environment
└── .env.example                   # Environment variables template
```

## 🛠️ Development

### Run Tests
```bash
pytest tests/
```

### Code Style
This project follows PEP 8 conventions with type hints and comprehensive docstrings.

## 📚 Tech Stack

- **UI Framework**: Streamlit
- **LLM Providers**: OpenAI (GPT-3.5-turbo), Anthropic (Claude)
- **Agent Framework**: LangChain
- **Calculations**: NumPy, custom orbital mechanics

## 🎓 Learning Resources

See `docs/VOYAGER.md` for comprehensive project documentation including:
- Technical implementation guide
- Architecture decisions
- Future roadmap (SpaceML integration, fine-tuning)

## 🤝 Contributing

This is a portfolio/learning project. Feedback and suggestions welcome!

## 📄 License

MIT License - see LICENSE file for details

## 🌌 Future Vision

- **SpaceML Integration**: Coordinate transformations, constellation optimization
- **Fine-tuned Models**: Custom space-domain LLM (Mistral 7B / Llama 3.1 8B)
- **Multi-mode Interface**: Expand beyond Mars to general space mission planning

---

**Current Status**: LLM provider abstraction layer (Step 1 complete)
**Next Milestone**: Claude provider implementation (Step 2)

*Built with ❤️ for the space industry*
