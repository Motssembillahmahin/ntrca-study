from datetime import datetime

from pydantic import BaseModel


class QuizStartRequest(BaseModel):
    subject: str
    subtopic: str
    count: int = 10


class QuestionSchema(BaseModel):
    id: int
    question_text: str
    options: list[str]
    correct_idx: int
    explanation: str

    model_config = {"from_attributes": True}


class QuizSessionSchema(BaseModel):
    id: int
    subject: str
    subtopic: str
    total_questions: int
    correct_count: int
    created_at: datetime
    questions: list[QuestionSchema] = []

    model_config = {"from_attributes": True}


class AnswerRequest(BaseModel):
    question_id: int
    answer_idx: int


class AnswerResult(BaseModel):
    is_correct: bool
    correct_idx: int
    explanation: str
