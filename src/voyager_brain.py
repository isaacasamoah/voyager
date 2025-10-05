"""VoyagerBrain - Natural language query parser for space missions.

Uses LLM to extract structured parameters from user queries.
"""

import json
# TODO: Import Dict from typing (for type hints)
from typing import Dict
# TODO: Import LLMProvider from llm.providers
from llm.providers import LLMProvider


class VoyagerBrain:
    """Parses natural language queries into structured mission parameters.

    Uses an LLM provider to convert natural language like:
        "Optimize 8 satellites for Mars coverage"

    Into structured data like:
        {"satellites": 8, "target": "Mars", "task": "optimize"}
    """

    def __init__(self, llm_provider):
        """Initialize VoyagerBrain with an LLM provider.

        Args:
            llm_provider: Any LLM provider implementing LLMProvider interface
                         (ClaudeProvider, OpenAIProvider, etc.)
        """
      
        self.llm = llm_provider 
       


    def parse_query(self, user_input: str):
        """Parse natural language query into structured parameters.

        This method:
        1. Validates the input
        2. Creates a system prompt telling the LLM to return JSON
        3. Calls the LLM with the user's query
        4. Parses the JSON response
        5. Returns the structured data

        Args:
            user_input: Natural language query from user
                       Example: "Calculate delta-v for a Mars transfer"

        Returns:
            Dictionary with extracted parameters
            Example: {"task": "calculate", "parameter": "delta-v", "target": "Mars"}

        Raises:
            ValueError: If user_input is empty or invalid
            RuntimeError: If LLM fails or returns invalid JSON
        """

        # TODO: Validate input - check if user_input is empty or only whitespace
        if not user_input or not user_input.strip():
            raise ValueError("you must provide user_input")
        # Hint: Similar to what you did in ClaudeProvider.complete()


        # TODO: Create a system prompt that instructs the LLM to:
        #       - Act as a space mission parameter parser
        #       - Return ONLY valid JSON (no extra text)
        #       - Extract mission-related parameters

        system_prompt = """You are a space mission parameter parser.
Extract parameters from user queries about space missions and ISS tracking.
Return ONLY valid JSON with no explanations or extra text.

Available tasks:
- "iss_location" - Get current ISS position
- "people_in_space" - List astronauts currently in space
- "track_starlink" - Track current Starlink satellite positions
- "optimize_constellation" - Optimize Starlink constellation positions
- "coordinate_transform" - Satellite rotation/transformation

Examples:
User: "Where is the ISS right now?"
Output: {"task": "iss_location"}

User: "Who is in space?"
Output: {"task": "people_in_space"}

User: "Show me 5 Starlink satellites"
Output: {"task": "track_starlink", "satellites": 5}

User: "Where are 10 Starlink satellites right now?"
Output: {"task": "track_starlink", "satellites": 10}

User: "Optimize 5 Starlink satellites for efficiency"
Output: {"task": "optimize_constellation", "satellites": 5, "weights": {"efficiency": 0.7, "redundancy": 0.2, "communication": 0.1}}

User: "Optimize 10 Starlink satellites balancing all constraints"
Output: {"task": "optimize_constellation", "satellites": 10, "weights": {"efficiency": 0.33, "redundancy": 0.33, "communication": 0.34}}
"""
        
        response = self.llm.complete(prompt = user_input,
                                    system_prompt = system_prompt,
                                    temperature = 0.3)
    
        try:
            response_json = json.loads(response)
            return response_json
        except json.JSONDecodeError as e:
            raise RuntimeError (f"llm provider did not return a proper json repons: {response}") from e
        
        # Pattern:
        # try:
        #     data = json.loads(response)
        #     return data
        # except json.JSONDecodeError as e:
        #     raise RuntimeError(f"LLM returned invalid JSON: {response}") from e

    

if __name__ == "__main__":
    from llm.providers import ClaudeProvider
    from dotenv import load_dotenv

    load_dotenv()
    brain = VoyagerBrain(ClaudeProvider())
    result = brain.parse_query("I want undersrand the current delta-v to mars")
    print(result)
