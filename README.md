# Voyager 🌌
**Chart your course through the cosmos with AI-powered space intelligence**

> A revolutionary platform combining real-time satellite tracking, advanced constellation optimization, and natural language interfaces to democratize access to space data and mission planning.

## ✨ Vision

Voyager is more than a tool—it's a **movement to make space accessible to everyone**. Whether you're a researcher analyzing satellite constellations, an engineer planning missions, or an enthusiast exploring the cosmos, Voyager bridges the gap between complex space systems and human curiosity.

We believe that:
- 🌍 **Space data should be open and understandable** to researchers, students, and enthusiasts worldwide
- 🤝 **Community-driven innovation** accelerates discovery and learning
- 🧠 **AI should augment human intelligence**, not replace it
- 🚀 **The future of space exploration** belongs to those who collaborate

## 🛰️ Features

### Real-Time Space Intelligence
- **ISS Tracking**: Live position tracking of the International Space Station with astronaut roster
- **Starlink Constellation Monitoring**: Track 8000+ Starlink satellites instantly using cached TLE data
- **Human-Readable Locations**: Every position geocoded to nearest city or geographic region
- **Optimized Performance**: Static TLE cache enables instant queries without API timeouts

### Advanced Constellation Optimization
- **SpaceML Integration**: Eigenvalue-based multi-constraint optimization
- **Customizable Weights**: Balance efficiency, redundancy, and communication priorities
- **Before/After Analysis**: Visualize optimization impact with side-by-side comparisons
- **Real Satellite Data**: Optimize actual Starlink constellations, not simulations

### Intelligent Agent System
- **VoyagerBrain**: Natural language query parser powered by Claude
- **Specialized Agents**:
  - `ISSAgent` - ISS tracking and astronaut data
  - `ConstellationAgent` - Starlink tracking and optimization
  - `MarsAgent` - Mission planning with LangChain tools
- **Multi-Agent Routing**: Intelligent task dispatch based on query intent

### Natural Language Interface
Ask questions naturally:
- *"Where is the ISS right now?"*
- *"Show me 10 Starlink satellites"*
- *"Optimize 5 satellites for communication efficiency"*
- *"Calculate delta-v for a Mars transfer"*
- *"Who is currently in space?"*

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Anthropic API key (for Claude)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/isaacasamoah/voyager.git
cd voyager

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Launch

```bash
streamlit run src/app.py
```

Navigate to `http://localhost:8501` and start exploring! 🌌

### Example Queries

Try these in the chat interface:

```
"Where is the ISS?"
"Track 5 Starlink satellites"
"Optimize 10 Starlink satellites prioritizing efficiency"
"Who is in space right now?"
"Calculate mission duration to Mars"
```

## 🏗️ Architecture

```
voyager/
├── src/
│   ├── app.py                          # Streamlit UI with multi-agent routing
│   ├── voyager_brain.py                # Natural language query parser
│   ├── agents/                         # Specialized agent implementations
│   │   ├── iss_agent.py               # ISS tracking agent
│   │   └── constellation_agent.py      # Starlink tracking & optimization
│   ├── data/sources/                   # Real-time data sources
│   │   ├── iss_tracker.py             # ISS position & astronaut data
│   │   └── starlink_tracker.py        # TLE fetching & orbit propagation
│   ├── spaceml/                        # Constellation optimization
│   │   └── constellation_optimizer.py  # Eigenvalue-based optimizer
│   ├── llm/                            # LLM provider abstraction
│   │   └── providers.py               # Claude & OpenAI providers
│   └── tools/                          # LangChain mission planning tools
│       └── mars_mission.py            # Delta-v, duration, launch windows
├── tests/                              # Test suite
└── docs/                               # Documentation
```

## 📚 Tech Stack

**AI & ML**
- Claude (Anthropic) - Query understanding & response generation
- LangChain - Agent framework for Mars mission planning
- Custom SpaceML - Eigenvalue-based constellation optimization

**Space Systems**
- Skyfield - Satellite orbit propagation (SGP4)
- Celestrak - TLE data source for satellite tracking
- Open Notify API - ISS real-time data

**Data & Computation**
- NumPy - Numerical computing
- SciPy - Optimization algorithms (L-BFGS-B)
- Geopy - Geocoding (Nominatim)

**Interface**
- Streamlit - Interactive web UI
- Python 3.11+ - Core implementation

## 🎯 Use Cases

### For Researchers
- Analyze real-time constellation configurations
- Test optimization algorithms on live satellite data
- Study orbital mechanics with interactive tools

### For Engineers
- Plan mission parameters (delta-v, launch windows)
- Optimize satellite deployments
- Visualize constellation coverage

### For Students
- Learn orbital mechanics interactively
- Explore agentic AI architectures
- Understand space systems through natural language

### For Space Enthusiasts
- Track the ISS in real-time
- Follow Starlink satellite positions
- Discover who's currently in space

## 🤝 Join the Community

Voyager is built on the belief that **space exploration advances through collaboration**. We're building a global community of researchers, engineers, students, and enthusiasts working together to democratize space intelligence.

### Ways to Contribute

🌟 **Share Your Ideas**
- Open issues for features you'd love to see
- Suggest improvements to existing functionality
- Share your use cases and learnings

🔧 **Improve the Code**
- Submit pull requests for bug fixes
- Add new data sources (GPS, weather satellites, etc.)
- Enhance optimization algorithms
- Improve documentation

📚 **Expand Knowledge**
- Write tutorials and guides
- Share research findings using Voyager
- Create educational content
- Translate documentation

🎨 **Enhance Experience**
- Design better visualizations
- Improve UI/UX
- Add accessibility features

### Community Guidelines

We're committed to maintaining a welcoming, inclusive environment where:
- Questions are encouraged, not judged
- Diverse perspectives drive innovation
- Collaboration trumps competition
- Learning together is the goal

**Code of Conduct**: Be respectful, constructive, and curious.

## 🛣️ Roadmap

### Near Term (Q1 2026)
- [ ] GPS constellation tracking
- [ ] 3D satellite visualization
- [ ] Coverage map generation
- [ ] Historical position playback
- [ ] Export optimization results

### Mid Term (Q2-Q3 2026)
- [ ] Multi-constellation comparison
- [ ] Launch schedule integration
- [ ] Space weather data
- [ ] Orbital debris tracking
- [ ] Fine-tuned space-domain LLM

### Long Term (2026+)
- [ ] Real-time collision avoidance
- [ ] Mission planning automation
- [ ] Community dataset sharing
- [ ] API for external integrations
- [ ] Mobile app

## 📖 Documentation

- **[Getting Started Guide](docs/VOYAGER.md)** - Comprehensive setup and usage
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and agent patterns
- **[API Reference](docs/API.md)** - Function and agent documentation
- **[Contributing Guide](CONTRIBUTING.md)** - How to get involved

## 🙏 Acknowledgments

Built with inspiration from:
- The global space community making data accessible
- Open source projects advancing AI and orbital mechanics
- Researchers sharing knowledge and tools freely

Special thanks to:
- **Celestrak** for TLE data
- **Open Notify** for ISS tracking APIs
- **Anthropic** for Claude's natural language understanding
- **The Skyfield Team** for orbit propagation tools

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

Free for academic, commercial, and personal use. We only ask that you:
- Credit Voyager in your work
- Share improvements back with the community
- Help make space accessible to all

## 🌠 Get Started Today

```bash
git clone https://github.com/isaacasamoah/voyager.git
cd voyager
conda env create -f environment.yml
conda activate voyager
streamlit run src/app.py
```

**Let's explore the cosmos together.** 🚀

---

*Built with curiosity, powered by community, designed for the future of space exploration.*

**Questions?** Open an issue or start a discussion!
**Want to contribute?** We'd love to have you—check out our [Contributing Guide](CONTRIBUTING.md)!

[![Twitter Follow](https://img.shields.io/twitter/follow/voyagerspace?style=social)](https://twitter.com/voyagerspace)
[![GitHub Stars](https://img.shields.io/github/stars/isaacasamoah/voyager?style=social)](https://github.com/isaacasamoah/voyager)
