import json
from unittest.mock import MagicMock, patch

import pytest

from app.services.claude_service import ClaudeService


@pytest.fixture
def claude_service():
    with patch("app.services.claude_service.anthropic.Anthropic"):
        return ClaudeService(api_key="test-key")


def test_generate_mcqs_returns_list_of_questions(claude_service):
    mock_response = MagicMock()
    mock_response.content = [
        MagicMock(
            text=json.dumps(
                [
                    {
                        "question": "What is 10 in binary?",
                        "options": ["1010", "1100", "1001", "1111"],
                        "correct_idx": 0,
                        "explanation": "10 in decimal = 1010 in binary.",
                    }
                ]
            )
        )
    ]
    claude_service._client.messages.create.return_value = mock_response

    result = claude_service.generate_mcqs("ICT", "Number Systems", 1)

    assert len(result) == 1
    assert result[0]["question"] == "What is 10 in binary?"
    assert result[0]["correct_idx"] == 0


def test_generate_mcqs_raises_on_invalid_json(claude_service):
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="not json")]
    claude_service._client.messages.create.return_value = mock_response

    with pytest.raises(ValueError, match="Invalid MCQ response"):
        claude_service.generate_mcqs("ICT", "Number Systems", 1)
