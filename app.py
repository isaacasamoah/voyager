import streamlit as st
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key =os.getenv("OPENAI_API_KEY"))
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "system", "content":  """You are an expert Mars mission planning assistant with deep
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
            supply calculations, and operational constraints."""}
    ]
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
    response = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=st.session_state.messages
      )  # Use full conversation history
  
         
    ai_response = response.choices[0].message.content
    st.session_state.messages.append({"role": "assistant", "content": ai_response})
    st.rerun()
  
  