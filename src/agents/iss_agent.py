"""ISS Agent - Natural language interface to ISS tracking.

Uses VoyagerBrain to parse queries and routes to ISS tracker functions.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from voyager_brain import VoyagerBrain
from data.sources.iss_tracker import (
    get_iss_location,
    get_people_in_space,
    get_nearest_city,
    format_timestamp
)


class ISSAgent:
    """Agent for handling ISS-related queries in natural language.

    Example:
        brain = VoyagerBrain(ClaudeProvider())
        agent = ISSAgent(brain)
        response = agent.query("Where is the ISS?")
    """

    def __init__(self, brain: VoyagerBrain):
        """Initialize ISSAgent with a VoyagerBrain.

        Args:
            brain: VoyagerBrain instance for parsing queries
        """
        self.brain = brain

    def query(self, user_input: str) -> str:
        """Process natural language query about ISS.

        Args:
            user_input: Natural language question

        Returns:
            Human-readable response string

        Examples:
            "Where is ISS?" -> "ISS is over Paris, France at 2025-10-05 12:30:00 UTC"
            "Who is in space?" -> "12 people in space: Oleg Kononenko (ISS)..."
        """
        # TODO: Use brain to parse the query
        parsed = self.brain.parse_query(user_input)

        # TODO: Route based on task
        task = parsed.get("task")

        # TODO: Call appropriate ISS tracker function
        if task == "iss_location":
             return self._handle_iss_location()
        elif task == "people_in_space":
             return self._handle_people_in_space()

        pass

    def _handle_iss_location(self) -> str:
        """Handle ISS location query."""
        iss_pos = get_iss_location()
        nearest_city = get_nearest_city(iss_pos["latitude"], iss_pos["longitude"])
        timestamp = format_timestamp(iss_pos["timestamp"])
        return (f"ISS is over {nearest_city}, at {timestamp}")
       

    def _handle_people_in_space(self) -> str:
        """Handle people in space query."""
        people_in_space = get_people_in_space()
        result = f"{people_in_space['number']} people in space: \n"
        for person in people_in_space["people"]:
            result +=f" - {person['name']} on {person['craft']}\n"
            
            
        return result
       
      


if __name__ == "__main__":
    import sys
    sys.path.insert(0, '/home/isaac/voyager/src')

    from llm.providers import ClaudeProvider
    from voyager_brain import VoyagerBrain
    from dotenv import load_dotenv

    load_dotenv()

    # Test the agent
    brain = VoyagerBrain(ClaudeProvider())
    agent = ISSAgent(brain)

    print(agent.query("Where is the ISS right now?"))
    print()
    print(agent.query("Who is in space?"))
