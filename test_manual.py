"""Manual test script for ClaudeProvider.

Quick verification that the provider works before writing proper pytest tests.
Run with: python test_manual.py
"""

from dotenv import load_dotenv
from src.llm.providers import ClaudeProvider
load_dotenv()


def test_basic_completion():
    """Test basic Claude API call."""
    # TODO: Print a message saying "Creating ClaudeProvider..."
    print("Creating ClaudeProvider...")

    provider = ClaudeProvider()

    print("Provider created successfully")

    prompt = 'Say hello to your new captain!'

    # TODO: Print the prompt you're sending
    print(prompt)

    response = provider.complete(prompt)

    print(response)

    # TODO: Print a success message
    if response: print("Sucess baby!")
    pass


def test_with_system_prompt():
    """Test Claude API call with system prompt."""
    # TODO: Create a ClaudeProvider instance
    provider = ClaudeProvider()

    response = provider.complete(prompt = "what is 2 + 2?", 
                                        system_prompt = "You are a helpful maths tutor, be very concise", 
                                        temperature = 0.3)

    # TODO: Print the response
    print(response)
    pass


if __name__ == "__main__":
    test_basic_completion()
    print("\n" + "="*50 + "\n")
    test_with_system_prompt()
