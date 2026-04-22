from sqlalchemy.orm import Session

from app.models.study import QuizSession
from app.schemas.progress import ProgressStats, TopicStat, WeakArea

WEAK_AREA_THRESHOLD = 0.60
MIN_QUESTIONS_FOR_WEAK_AREA = 3


class ProgressService:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_stats(self) -> ProgressStats:
        sessions = self._db.query(QuizSession).all()

        if not sessions:
            return ProgressStats(
                total_questions=0,
                total_correct=0,
                overall_accuracy=0.0,
                topic_stats=[],
                weak_areas=[],
            )

        total_questions = sum(s.total_questions for s in sessions)
        total_correct = sum(s.correct_count for s in sessions)
        overall_accuracy = total_correct / total_questions if total_questions else 0.0

        topic_map: dict[tuple[str, str], list[int]] = {}
        for s in sessions:
            key = (s.subject, s.subtopic)
            if key not in topic_map:
                topic_map[key] = [0, 0]
            topic_map[key][0] += s.total_questions
            topic_map[key][1] += s.correct_count

        topic_stats = [
            TopicStat(
                subject=subject,
                subtopic=subtopic,
                total=totals[0],
                correct=totals[1],
                accuracy=totals[1] / totals[0] if totals[0] else 0.0,
            )
            for (subject, subtopic), totals in topic_map.items()
        ]

        weak_areas = [
            WeakArea(subject=t.subject, subtopic=t.subtopic, accuracy=t.accuracy)
            for t in topic_stats
            if t.accuracy < WEAK_AREA_THRESHOLD and t.total >= MIN_QUESTIONS_FOR_WEAK_AREA
        ]
        weak_areas.sort(key=lambda w: w.accuracy)

        return ProgressStats(
            total_questions=total_questions,
            total_correct=total_correct,
            overall_accuracy=overall_accuracy,
            topic_stats=topic_stats,
            weak_areas=weak_areas,
        )
