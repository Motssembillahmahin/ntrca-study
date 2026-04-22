import json

from sqlalchemy.orm import Session

from app.models.study import Answer, Question, QuizSession
from app.schemas.quiz import AnswerResult
from app.services.claude_service import ClaudeService


class QuizService:
    def __init__(self, db: Session, claude: ClaudeService) -> None:
        self._db = db
        self._claude = claude

    def create_session(self, subject: str, subtopic: str, count: int) -> QuizSession:
        raw_questions = self._claude.generate_mcqs(subject, subtopic, count)

        session = QuizSession(
            subject=subject,
            subtopic=subtopic,
            total_questions=len(raw_questions),
            correct_count=0,
        )
        self._db.add(session)
        self._db.flush()

        for q in raw_questions:
            question = Question(
                session_id=session.id,
                question_text=q["question"],
                options_json=json.dumps(q["options"]),
                correct_idx=q["correct_idx"],
                explanation=q["explanation"],
            )
            self._db.add(question)

        self._db.commit()
        self._db.refresh(session)
        return session

    def get_session(self, session_id: int) -> QuizSession | None:
        return self._db.get(QuizSession, session_id)

    def record_answer(
        self, session_id: int, question_id: int, answer_idx: int
    ) -> AnswerResult:
        question = self._db.get(Question, question_id)
        is_correct = answer_idx == question.correct_idx

        answer = Answer(
            question_id=question_id,
            user_answer_idx=answer_idx,
            is_correct=is_correct,
        )
        self._db.add(answer)

        if is_correct:
            session = self._db.get(QuizSession, session_id)
            session.correct_count += 1

        self._db.commit()

        return AnswerResult(
            is_correct=is_correct,
            correct_idx=question.correct_idx,
            explanation=question.explanation,
        )

    def list_sessions(self) -> list[QuizSession]:
        return self._db.query(QuizSession).order_by(QuizSession.created_at.desc()).all()
