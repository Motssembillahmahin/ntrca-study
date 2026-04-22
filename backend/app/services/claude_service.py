import json
from collections.abc import AsyncGenerator
from pathlib import Path

import anthropic


class ClaudeService:
    _system_prompt: str
    _quiz_gen_template: str

    def __init__(self, api_key: str) -> None:
        self._client = anthropic.Anthropic(api_key=api_key)
        prompts_dir = Path(__file__).parent.parent / "prompts"
        self._system_prompt = (prompts_dir / "system.txt").read_text()
        self._quiz_gen_template = (prompts_dir / "quiz_gen.txt").read_text()

    def _system_block(self) -> list[dict]:
        return [
            {
                "type": "text",
                "text": self._system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ]

    def generate_mcqs(self, subject: str, subtopic: str, count: int) -> list[dict]:
        prompt = (
            self._quiz_gen_template.replace("{count}", str(count))
            .replace("{subtopic}", subtopic)
            .replace("{subject}", subject)
        )
        response = self._client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=self._system_block(),
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid MCQ response from Claude: {e}") from e

    async def stream_explanation(
        self, question_text: str, options: list[str], correct_idx: int, user_idx: int
    ) -> AsyncGenerator[str, None]:
        correct = options[correct_idx]
        chosen = options[user_idx]
        verdict = "correctly" if user_idx == correct_idx else "incorrectly"
        content = (
            f"The student answered {verdict}. "
            f"They chose: '{chosen}'. "
            f"Correct answer: '{correct}'. "
            f"Question: {question_text}\n\n"
            f"Explain why '{correct}' is the correct answer in 3-4 sentences."
        )
        async with self._client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system=self._system_block(),
            messages=[{"role": "user", "content": content}],
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def stream_chat(
        self, message: str, history: list[dict]
    ) -> AsyncGenerator[str, None]:
        messages = history + [{"role": "user", "content": message}]
        async with self._client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=self._system_block(),
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
