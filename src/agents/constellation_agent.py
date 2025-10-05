"""Constellation Agent - Natural language interface for Starlink constellation optimization.

Uses VoyagerBrain to parse queries and optimizes satellite constellations using SpaceML.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from voyager_brain import VoyagerBrain
from data.sources.starlink_tracker import get_starlink_constellation
from data.sources.iss_tracker import get_nearest_city
from spaceml.constellation_optimizer import optimize_satellite_positions


class ConstellationAgent:
    """Agent for optimizing satellite constellations in natural language.

    Example:
        brain = VoyagerBrain(ClaudeProvider())
        agent = ConstellationAgent(brain)
        response = agent.query("Optimize 5 Starlink satellites for efficiency")
    """

    def __init__(self, brain: VoyagerBrain):
        """Initialize ConstellationAgent with a VoyagerBrain.

        Args:
            brain: VoyagerBrain instance for parsing queries
        """
        self.brain = brain

    def query(self, user_input: str) -> str:
        """Process natural language query about constellation optimization.

        Args:
            user_input: Natural language question

        Returns:
            Human-readable response string

        Examples:
            "Optimize 5 Starlink satellites" -> Fetches, optimizes, returns formatted result
        """
        parsed = self.brain.parse_query(user_input)
        task = parsed.get("task")

        if task == "optimize_constellation":
            return self._handle_optimize_constellation(parsed)
        elif task == "track_starlink":
            return self._handle_track_starlink(parsed)
        else:
            return f"Unknown constellation task: {task}"

    def _handle_optimize_constellation(self, parsed: dict) -> str:
        """Handle constellation optimization query.

        Args:
            parsed: Parsed query dict with 'satellites' and 'weights'

        Returns:
            Formatted string with optimization results
        """
        num_satellites = parsed.get("satellites", 5)
        weights = parsed.get("weights", {
            "efficiency": 0.4,
            "redundancy": 0.3,
            "communication": 0.3
        })

        # Normalize weights to sum to 1
        total = sum(weights.values())
        if total > 0:
            weights = {k: v/total for k, v in weights.items()}

        # Fetch real Starlink constellation
        result = f"# 🛰️ Starlink Constellation Optimization\n\n"
        result += f"**Satellites:** {num_satellites}  \n"
        result += f"**Optimization Weights:**\n"
        result += f"- Efficiency: {weights['efficiency']:.0%}\n"
        result += f"- Redundancy: {weights['redundancy']:.0%}\n"
        result += f"- Communication: {weights['communication']:.0%}\n\n"

        try:
            constellation = get_starlink_constellation(num_satellites)

            result += f"## 📍 Current Constellation Positions\n\n"
            for i, pos in enumerate(constellation, 1):
                city = get_nearest_city(pos[0], pos[1])
                result += f"**Satellite {i}:** `{pos[0]:6.2f}°, {pos[1]:7.2f}°` → {city}  \n"

            # Optimize
            result += f"\n## ⚙️ Running SpaceML Eigenvalue Optimizer...\n\n"
            optimized = optimize_satellite_positions(constellation, weights)

            result += f"## ✅ Optimized Constellation\n\n"
            for i, pos in enumerate(optimized, 1):
                new_city = get_nearest_city(pos[0], pos[1])
                orig = constellation[i-1]
                orig_city = get_nearest_city(orig[0], orig[1])
                result += f"**Satellite {i}:** `{pos[0]:6.2f}°, {pos[1]:7.2f}°` → {new_city}  \n"
                result += f"  *Moved from: `{orig[0]:6.2f}°, {orig[1]:7.2f}°` ({orig_city})*  \n\n"

            return result

        except Exception as e:
            return f"❌ Optimization failed: {str(e)}"

    def _handle_track_starlink(self, parsed: dict) -> str:
        """Handle Starlink tracking query.

        Args:
            parsed: Parsed query dict with 'satellites'

        Returns:
            Formatted string with current satellite positions
        """
        num_satellites = parsed.get("satellites", 5)

        result = f"# 🛰️ Starlink Satellite Tracking\n\n"
        result += f"**Tracking {num_satellites} Starlink satellites**\n\n"

        try:
            constellation = get_starlink_constellation(num_satellites)

            result += f"## 📍 Current Positions\n\n"
            for i, pos in enumerate(constellation, 1):
                city = get_nearest_city(pos[0], pos[1])
                result += f"**Satellite {i}:** `{pos[0]:6.2f}°, {pos[1]:7.2f}°` → {city}  \n"

            return result

        except Exception as e:
            return f"❌ Tracking failed: {str(e)}"


if __name__ == "__main__":
    from llm.providers import ClaudeProvider
    from dotenv import load_dotenv

    load_dotenv()

    # Test the agent
    brain = VoyagerBrain(ClaudeProvider())
    agent = ConstellationAgent(brain)

    print(agent.query("Optimize 5 Starlink satellites for efficiency"))
