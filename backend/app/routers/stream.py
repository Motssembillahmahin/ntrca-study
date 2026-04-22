from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import config
from app.database import get_db
from app.models.study import Question
from app.services.chat_service import ChatService
from app.services.claude_service import ClaudeService

router = APIRouter(prefix="/stream", tags=["stream"])


def _sse(generator):
    async def event_stream():
        async for chunk in generator:
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/explain")
async def stream_explain(
    question_id: int = Query(...),
    answer_idx: int = Query(...),
    db: Session = Depends(get_db),
):
    q = db.get(Question, question_id)
    claude = ClaudeService(config.anthropic_api_key)
    return _sse(claude.stream_explanation(q.question_text, q.options, q.correct_idx, answer_idx))


@router.get("/chat")
async def stream_chat(
    message: str = Query(...),
    db: Session = Depends(get_db),
):
    chat_svc = ChatService(db)
    history = chat_svc.get_history()
    claude = ClaudeService(config.anthropic_api_key)

    async def streamed():
        full_response = ""
        async for chunk in claude.stream_chat(message, history):
            full_response += chunk
            yield chunk
        chat_svc.save_message("user", message)
        chat_svc.save_message("assistant", full_response)

    return _sse(streamed())
