# Step 4: VoyagerBrain Integration - Pseudocode

## Goal
Integrate VoyagerBrain into the Streamlit app to parse user queries and extract structured parameters.

---

## Changes Needed in `src/app.py`

### 1. Add Imports (at the top)
```python
# TODO: Import VoyagerBrain from voyager_brain
# TODO: Import ClaudeProvider from llm.providers
```

---

### 2. Initialize VoyagerBrain (after line 44, before creating the agent)
```python
# TODO: Create a VoyagerBrain instance
# Pattern: brain = VoyagerBrain(ClaudeProvider())
# This creates a brain that uses Claude to parse queries
```

---

### 3. Use VoyagerBrain to Parse Queries (in the `if user_input:` block, around line 68)

**Current code:**
```python
if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    response = agent_executor.invoke({"input": user_input})
    ai_response = response["output"][0]["text"]
    st.session_state.messages.append({"role": "assistant", "content": ai_response})
    st.rerun()
```

**What to add:**
```python
if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})

    # TODO: Parse the query with VoyagerBrain
    # Pattern:
    # try:
    #     parsed_params = brain.parse_query(user_input)
    #     # Display parsed parameters using st.expander() for transparency
    #     # Use st.json(parsed_params) to show the structured data
    # except Exception as e:
    #     # If parsing fails, set parsed_params = None and continue
    #     # Optionally show a warning with st.warning()

    response = agent_executor.invoke({"input": user_input})
    ai_response = response["output"][0]["text"]
    st.session_state.messages.append({"role": "assistant", "content": ai_response})
    st.rerun()
```

---

## New Streamlit Concepts You'll Use

### `st.expander()`
Creates a collapsible section:
```python
with st.expander("Title Here", expanded=False):
    st.write("Content that can be hidden/shown")
```

### `st.json()`
Pretty-prints JSON/dict data:
```python
data = {"task": "calculate", "target": "Mars"}
st.json(data)  # Shows formatted JSON
```

### `st.warning()`
Shows a warning message:
```python
st.warning("Something went wrong!")
```

---

## Questions to Think About

1. **Why wrap in try/except?**
   - VoyagerBrain might fail (bad JSON from Claude, network error, etc.)
   - We don't want the whole app to crash if parsing fails
   - Better to continue without parsing than to break the chat

2. **What does `expanded=False` mean?**
   - The expander starts collapsed (user can click to open)
   - `expanded=True` would show it open by default

3. **Do we need to use `parsed_params` for anything?**
   - Not yet! Right now we're just showing it for transparency
   - Later, we could use it to route to specific tools or enhance the agent's context
   - For now, it's a cool "debug view" that shows the AI understanding the query

---

## Your Task

1. Open `src/app.py`
2. Add the imports at the top
3. Initialize VoyagerBrain after session_state check
4. Add the parsing logic in the `if user_input:` block
5. Test it out!

**Let me know when you're ready to code or if you want to discuss the approach first!** 🚀
