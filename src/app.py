import streamlit as st
import os
from dotenv import load_dotenv
import numpy as np
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.prompts import ChatPromptTemplate
from tools.mars_mission import calculate_delta_v_to_mars, calculate_mission_duration, find_launch_window
from voyager_brain import VoyagerBrain
from llm.providers import ClaudeProvider
from agents.iss_agent import ISSAgent
from agents.constellation_agent import ConstellationAgent 

load_dotenv()
llm = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    temperature=0.3
)

brain = VoyagerBrain(ClaudeProvider())
iss_agent = ISSAgent(brain)
constellation_agent = ConstellationAgent(brain)

tools = [calculate_delta_v_to_mars, calculate_mission_duration, find_launch_window]

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are Voyager, an AI-powered space exploration assistant and community intelligence platform.

Your capabilities:
- Access and analyze real-time data from satellites, Deep Space Network, and mission feeds
- Visualize orbital mechanics, satellite constellations, and mission trajectories
- Interpret spacecraft telemetry, communications, and sensor data
- Provide mission status updates and anomaly detection
- Facilitate knowledge sharing across the global space community

Your purpose:
- Make space data accessible and understandable to everyone
- Connect researchers, engineers, enthusiasts, and students worldwide
- Learn continuously from expert feedback to improve space domain expertise
- Enable collaborative discovery and innovation in space exploration

Communication style:
- Technical yet approachable - explain complex concepts clearly
- Show calculations and reasoning when helpful
- Cite data sources and encourage community verification
- Ask clarifying questions to provide the most relevant insights

When analyzing data or answering questions:
1. Use available tools for calculations (delta-v, mission duration, launch windows)
2. Perform calculations using validated orbital mechanics
3. Explain findings in context of mission objectives
4. Provide specific, technical answers with real numbers when possible
     """),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

if "messages" not in st.session_state:
    st.session_state.messages = []
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools,
  verbose=True)

# Subtle, professional header inspired by NASA
st.markdown("""
<style>
    .voyager-header {
        padding: 1.5rem 0 1rem 0;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 2rem;
    }

    .voyager-title {
        font-size: 2.5rem;
        font-weight: 400;
        color: #0b3d91;
        margin: 0;
        padding-bottom: 0.5rem;
        letter-spacing: 0.3rem;
    }
</style>

<div class="voyager-header">
    <h1 class="voyager-title">VOYAGER</h1>
</div>
""", unsafe_allow_html=True)

for message in st.session_state.messages:
    if message["role"] != "system": # Don't show system message
        with st.chat_message(message["role"]):
            st.write(message["content"])

# Handle new input
user_input = st.chat_input("Ask me what I can do 🌌")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})

    with st.chat_message("user"):
        st.write(user_input)

    try:
        # Parse query to determine task type
        parsed_params = brain.parse_query(user_input)
        with st.expander("🧠 Query Analysis", expanded=False):
            st.json(parsed_params)

        task = parsed_params.get("task")

        # Route to appropriate agent based on task
        with st.chat_message("assistant"):
            if task == "help":
                # Show capabilities with mystery and intrigue
                ai_response = """## 🌌 Voyager Capabilities

I can help you explore the cosmos through data and intelligence. Try asking me:

**Real-Time Tracking**
- *"Where is the ISS right now?"*
- *"Who is in space?"*
- *"Show me 10 Starlink satellites"*

**Constellation Intelligence**
- *"Optimize 5 satellites for efficiency"*
- *"Balance 10 satellites across all constraints"*

**Mission Planning**
- *"Calculate delta-v to Mars"*
- *"Find the next launch window to Mars"*
- *"What's the mission duration to Mars?"*

The cosmos awaits your questions."""
                st.write(ai_response)
            elif task in ["iss_location", "people_in_space"]:
                # Use ISSAgent for ISS queries
                ai_response = iss_agent.query(user_input)
                st.write(ai_response)
            elif task in ["optimize_constellation", "track_starlink"]:
                # Use ConstellationAgent for Starlink queries
                ai_response = constellation_agent.query(user_input)
                st.write(ai_response)
            else:
                # Use LangChain agent for Mars missions
                response = agent_executor.invoke({"input": user_input})
                ai_response = response["output"][0]["text"]
                st.write(ai_response)

        st.session_state.messages.append({"role": "assistant", "content": ai_response})

    except Exception as e:
        with st.chat_message("assistant"):
            error_msg = f"Sorry, I encountered an error: {str(e)}"
            st.error(error_msg)
            st.session_state.messages.append({"role": "assistant", "content": error_msg})
  
  