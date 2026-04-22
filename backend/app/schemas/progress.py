from pydantic import BaseModel


class TopicStat(BaseModel):
    subject: str
    subtopic: str
    total: int
    correct: int
    accuracy: float


class WeakArea(BaseModel):
    subject: str
    subtopic: str
    accuracy: float


class ProgressStats(BaseModel):
    total_questions: int
    total_correct: int
    overall_accuracy: float
    topic_stats: list[TopicStat]
    weak_areas: list[WeakArea]
