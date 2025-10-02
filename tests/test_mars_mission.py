"""Tests for Mars mission calculation tools."""

import pytest
from src.tools.mars_mission import (
    calculate_delta_v_to_mars,
    calculate_mission_duration,
    find_launch_window
)


class TestMarsMissionTools:
    """Test suite for Mars mission planning tools."""

    def test_delta_v_calculation_returns_string(self):
        """Delta-v calculation should return a formatted string."""
        result = calculate_delta_v_to_mars.invoke({})
        assert isinstance(result, str)
        assert "km/s" in result

    def test_mission_duration_returns_string(self):
        """Mission duration calculation should return a formatted string."""
        result = calculate_mission_duration.invoke({})
        assert isinstance(result, str)
        assert "months" in result

    def test_launch_window_returns_string(self):
        """Launch window finder should return a formatted string."""
        result = find_launch_window.invoke({})
        assert isinstance(result, str)
        assert "window" in result.lower()

    # TODO: Add more detailed numerical validation tests
    # TODO: Add edge case tests
    # TODO: Add integration tests with LangChain agent
