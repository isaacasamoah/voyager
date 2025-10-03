"""LLM provider abstraction layer for Voyager.

Allows swapping between different LLM providers (Claude, GPT-4, local models)
without changing application code.
"""

import os
from abc import ABC, abstractmethod
from typing import Optional

import anthropic


class LLMProvider(ABC):
    """Abstract base class for LLM providers.

    Implementations must provide a complete() method that takes a prompt
    and returns a string response.
    """

    @abstractmethod
    def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """Generate a completion from the LLM.

        Args:
            prompt: The user's input prompt
            system_prompt: Optional system instructions for the LLM
            temperature: Sampling temperature (0.0-1.0, lower = more deterministic)
            max_tokens: Maximum tokens in response

        Returns:
            The LLM's response as a string

        Raises:
            ValueError: If prompt is empty or parameters are invalid
            RuntimeError: If the LLM API call fails
        """
        pass
