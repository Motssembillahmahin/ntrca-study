import { useState } from "react";
import { submitAnswer, type QuestionData } from "../api/quiz";
import { useStream } from "../hooks/useStream";

const LABELS = ["A", "B", "C", "D"];

interface Props {
  sessionId: number;
  question: QuestionData;
  questionNumber: number;
  total: number;
  onAnswered: (isCorrect: boolean) => void;
}

export function QuizCard({ sessionId, question, questionNumber: _qn, total: _t, onAnswered }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { text: explanation, loading, startStream } = useStream();

  async function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const res = await submitAnswer(sessionId, question.id, idx);
    setIsCorrect(res.is_correct);
    startStream(`/api/stream/explain?question_id=${question.id}&answer_idx=${idx}`);
    onAnswered(res.is_correct);
  }

  return (
    <div className="quiz-card">
      <p className="quiz-question-text">{question.question_text}</p>

      <div className="options-list">
        {question.options.map((opt, idx) => {
          let cls = "option-btn";
          if (selected !== null) {
            cls += " answered";
            if (idx === question.correct_idx) cls += " correct";
            else if (idx === selected && !isCorrect) cls += " wrong";
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <span className="option-letter">{LABELS[idx]}</span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {isCorrect !== null && (
        <div className="explanation-box">
          <div
            className="explanation-verdict"
            style={{ color: isCorrect ? "var(--green)" : "var(--red)" }}
          >
            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
          </div>
          <div>
            {explanation || (loading ? (
              <span className="text-faint" style={{ fontSize: 13 }}>Generating explanation…</span>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}
