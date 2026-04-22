import { useState } from "react";
import { submitAnswer, type QuestionData } from "../api/quiz";
import { useStream } from "../hooks/useStream";

interface Props {
  sessionId: number;
  question: QuestionData;
  questionNumber: number;
  total: number;
  onAnswered: (isCorrect: boolean) => void;
}

export function QuizCard({ sessionId, question, questionNumber, total, onAnswered }: Props) {
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
    <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16 }}>
      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        Question {questionNumber} / {total}
      </p>
      <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>{question.question_text}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options.map((opt, idx) => {
          let bg = "#f9fafb";
          let border = "1px solid #d1d5db";
          if (selected !== null) {
            if (idx === question.correct_idx) { bg = "#d1fae5"; border = "1px solid #10b981"; }
            else if (idx === selected && !isCorrect) { bg = "#fee2e2"; border = "1px solid #ef4444"; }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                padding: "10px 16px",
                background: bg,
                border,
                borderRadius: 6,
                cursor: selected !== null ? "default" : "pointer",
                textAlign: "left",
                fontSize: 14,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {isCorrect !== null && (
        <div style={{ marginTop: 16, padding: 12, background: "#f0fdf4", borderRadius: 6 }}>
          <strong style={{ color: isCorrect ? "#059669" : "#dc2626" }}>
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </strong>
          <p style={{ marginTop: 8, color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
            {explanation || (loading ? "Loading explanation…" : "")}
          </p>
        </div>
      )}
    </div>
  );
}
