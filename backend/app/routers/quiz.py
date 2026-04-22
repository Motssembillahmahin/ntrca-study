from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import config
from app.database import get_db
from app.schemas.quiz import AnswerRequest, AnswerResult, QuizSessionSchema, QuizStartRequest
from app.services.claude_service import ClaudeService
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/quiz", tags=["quiz"])


def get_quiz_service(db: Session = Depends(get_db)) -> QuizService:
    return QuizService(db, ClaudeService(config.anthropic_api_key))


@router.post("/start", response_model=QuizSessionSchema)
def start_quiz(
    body: QuizStartRequest,
    svc: QuizService = Depends(get_quiz_service),
):
    try:
        return svc.create_session(body.subject, body.subtopic, body.count)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/{session_id}/answer", response_model=AnswerResult)
def submit_answer(
    session_id: int,
    body: AnswerRequest,
    svc: QuizService = Depends(get_quiz_service),
):
    return svc.record_answer(session_id, body.question_id, body.answer_idx)


@router.get("/sessions", response_model=list[QuizSessionSchema])
def list_sessions(svc: QuizService = Depends(get_quiz_service)):
    return svc.list_sessions()
