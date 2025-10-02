"""Tests for LLM provider abstraction layer."""

import pytest
from src.llm.providers import LLMProvider


class TestLLMProvider:
    """Test suite for LLM provider interface."""

    def test_cannot_instantiate_abstract_class(self):
        """LLMProvider is abstract and cannot be instantiated directly."""
        with pytest.raises(TypeError):
            LLMProvider()

    # TODO: Add tests for ClaudeProvider once implemented
    # TODO: Add tests for OpenAIProvider once implemented
    # TODO: Add mock provider tests
