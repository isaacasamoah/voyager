import streamlit as st
import os
from dotenv import load_dotenv
import numpy as np
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate
from tools import calculate_delta_v_to_mars, calculate_mission_duration, find_launch_window

load_dotenv()
llm = ChatOpenAI(model ="gpt-3.5-turbo", api_key = os.getenv("OPENAI_API_KEY"), temperature =0)

tools = [calculate_delta_v_to_mars, calculate_mission_duration, find_launch_window]

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert Mars mission planning assistant with deep
            knowledge of:
            - Orbital mechanics and transfer windows
            - Life support systems and resource requirements
            - Launch vehicle capabilities and payload constraints
            - Mars surface operations and equipment needs
            - Timeline planning for multi-year missions

            Provide specific, technical answers with real numbers when
            possible.
            Focus on practical mission planning aspects like delta-v
            requirements,
            supply calculations, and operational constraints.
            You have orbital mechanics calculations tools, use
            them when the user asks for specific calcuations.
     """),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

if "messages" not in st.session_state:
    st.session_state.messages = []
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools,
  verbose=True)  

st.title("Mars mission planning interface")

st.text("A natural language interface to understand Mars mission requirements and preparation")

for message in st.session_state.messages:
    if message["role"] != "system": # Don't show system message
        with st.chat_message(message["role"]):
            st.write(message["content"])

# Handle new input
user_input = st.chat_input("Let's talk about going to Mars")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})   
    response = agent_executor.invoke({"input": user_input})
    ai_response = response["output"]
    st.session_state.messages.append({"role": "assistant", "content": ai_response})
    st.rerun()
  
  