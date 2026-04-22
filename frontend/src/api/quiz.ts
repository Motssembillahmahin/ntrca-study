const BASE = "/api";

export interface QuestionData {
  id: number;
  question_text: string;
  options: string[];
  correct_idx: number;
  explanation: string;
}

export interface QuizSessionData {
  id: number;
  subject: string;
  subtopic: string;
  total_questions: number;
  correct_count: number;
  questions: QuestionData[];
}

export interface AnswerResult {
  is_correct: boolean;
  correct_idx: number;
  explanation: string;
}

export async function startQuiz(
  subject: string,
  subtopic: string,
  count: number
): Promise<QuizSessionData> {
  const res = await fetch(`${BASE}/quiz/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, subtopic, count }),
  });
  if (!res.ok) throw new Error("Failed to start quiz");
  return res.json();
}

export async function submitAnswer(
  sessionId: number,
  questionId: number,
  answerIdx: number
): Promise<AnswerResult> {
  const res = await fetch(`${BASE}/quiz/${sessionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId, answer_idx: answerIdx }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
}
