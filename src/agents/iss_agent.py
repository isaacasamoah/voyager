"""ISS Agent - Natural language interface to ISS tracking.

Uses VoyagerBrain to parse queries and routes to ISS tracker functions.
"""

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
        # parsed = self.brain.parse_query(user_input)

        # TODO: Route based on task
        # task = parsed.get("task")

        # TODO: Call appropriate ISS tracker function
        # if task == "iss_location":
        #     return self._handle_iss_location()
        # elif task == "people_in_space":
        #     return self._handle_people_in_space()

        pass

    def _handle_iss_location(self) -> str:
        """Handle ISS location query."""
        # TODO: Call get_iss_location()
        # TODO: Call get_nearest_city() with lat/lon
        # TODO: Call format_timestamp()
        # TODO: Return formatted string like:
        #       "ISS is over Paris, France at 2025-10-05 12:30:00 UTC"
        pass

    def _handle_people_in_space(self) -> str:
        """Handle people in space query."""
        # TODO: Call get_people_in_space()
        # TODO: Format into readable string
        # TODO: Return something like:
        #       "12 people in space:\n  - Oleg Kononenko on ISS\n  - ..."
        pass


if __name__ == "__main__":
    from llm.providers import ClaudeProvider
    from dotenv import load_dotenv

    load_dotenv()

    # Test the agent
    brain = VoyagerBrain(ClaudeProvider())
    agent = ISSAgent(brain)

    print(agent.query("Where is the ISS right now?"))
    print("\n" + agent.query("Who is in space?"))
