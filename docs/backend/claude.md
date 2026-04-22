# Backend — Claude Integration

The app uses the Anthropic Python SDK (`anthropic>=0.40.0`) with `claude-sonnet-4-6`.

All Claude logic is isolated in `app/services/claude_service.py`.

---

## Model

```python
MODEL = "claude-sonnet-4-6"
```

---

## System Prompt

`app/prompts/system.txt` (~2000 tokens) instructs Claude to act as an NTRCA exam assistant. It covers:

- All ICT subtopics: Number Systems, Logic Gates, Networking (OSI), Database (SQL), OOP, Web, Computer Organization, Programming, ICT Policy
- General subjects: Bangla grammar, English grammar, Math, GK
- Exam format: Preliminary (100 MCQ) and Subject exam structure
- Framing: Explain at the level of a teacher-candidate — textbook-accurate, simple language, Bengali script for grammar topics

---

## Prompt Caching

The system prompt block is sent with `cache_control: {"type": "ephemeral"}`:

```python
{
    "type": "text",
    "text": self._system_prompt,
    "cache_control": {"type": "ephemeral"},
}
```

Anthropic caches prompt prefixes for ~5 minutes. Since the system prompt is identical across all calls in a session, subsequent calls skip re-processing those tokens — reducing both latency and cost.

---

## MCQ Generation

### Template

`app/prompts/quiz_gen.txt` contains placeholders `{count}`, `{subtopic}`, `{subject}`.

Substitution uses `.replace()` instead of `.format()` because the template includes a raw JSON example with `{}` braces that would cause `KeyError` with `.format()`:

```python
prompt = (
    self._quiz_gen_template
    .replace("{count}", str(count))
    .replace("{subtopic}", subtopic)
    .replace("{subject}", subject)
)
```

### Expected output

Claude is instructed to return **only a valid JSON array** (no markdown fences):

```json
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_idx": 0,
    "explanation": "..."
  }
]
```

The service parses with `json.loads()` and raises `ValueError` if parsing fails.

---

## Streaming

Both `stream_explanation` and `stream_chat` use `client.messages.stream()` and yield text chunks as they arrive:

```python
async def stream_explanation(self, ...) -> AsyncGenerator[str, None]:
    async with self._client.messages.stream(
        model=MODEL,
        max_tokens=1024,
        system=[...],
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            yield text
```

The router wraps any async generator in `_sse()` which formats chunks as SSE events and appends a `[DONE]` sentinel:

```python
def _sse(generator):
    async def event_stream():
        async for chunk in generator:
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

---

## Chat History

`stream_chat` receives the last 20 messages from `ChatService.get_history()` as the `messages` list. After the stream completes, both the user message and the fully-assembled assistant response are persisted to the database.

```python
async def streamed():
    full_response = ""
    async for chunk in claude.stream_chat(message, history):
        full_response += chunk
        yield chunk
    chat_svc.save_message("user", message)
    chat_svc.save_message("assistant", full_response)
```
