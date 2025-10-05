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

load_dotenv()
llm = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    temperature=0.3
)

brain = VoyagerBrain(ClaudeProvider())

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

st.markdown("<h1 style='text-align: center;'>🪐 Voyager 🚀</h1>", unsafe_allow_html=True)

st.markdown("<p style='text-align: center;'>A natural language interface for space exploration</p>", unsafe_allow_html=True)

# Add some spacing
st.markdown("<br>", unsafe_allow_html=True)

for message in st.session_state.messages:
    if message["role"] != "system": # Don't show system message
        with st.chat_message(message["role"]):
            st.write(message["content"])

# Handle new input
user_input = st.chat_input("Chart your course through the cosmos")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})   
    try:
        parsed_params = brain.parse_query(user_input)
        with st.expander("🧠 Query Analysis", expanded=False):
            st.json(parsed_params)
    except Exception as e:
        parsed_params = None
        st.warning(f"Query parsing failed: {e}")
    
    response = agent_executor.invoke({"input": user_input})
    ai_response = response["output"][0]["text"]
    st.session_state.messages.append({"role": "assistant", "content": ai_response})
    st.rerun()
  
  