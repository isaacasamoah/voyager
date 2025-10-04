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

class ClaudeProvider(LLMProvider):
    """Class for Anthropic Claude LLM provider 
        Validates api key, provides access to the claude api, facilitates calls to the api through the complete method"""

    def __init__(self, api_key:Optional[str] = None):
        """Retreive the API key
            Validate that the key exists
            Create a connection to the API
        """
     
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found. Set environment variable or pass api_key parameter")       

        self.client = anthropic.Anthropic(api_key=self.api_key)

    def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """ Complete method (from astract method for the CLaude Provider)"""

        if not prompt or not prompt.strip():
            raise ValueError("Prompt must not be empty")

        if not 0 <= temperature <= 1:
            raise ValueError(f"Temperature must be between 0 and 1, got {temperature}")

        if max_tokens < 1:
            raise ValueError(f"max_tokens must be positive, got {max_tokens}")


        try:
            response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt if system_prompt else "",  # Can be empty string if None
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
            text = response.content[0].text
            return text
        except anthropic.APIError as e:
            raise RuntimeError (f"Claude API error {e}") from e



