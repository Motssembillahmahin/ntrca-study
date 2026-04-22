import { useEffect, useState } from "react";
import { startQuiz, type QuizSessionData } from "../api/quiz";
import { getTopics } from "../api/topics";
import { QuizCard } from "../components/QuizCard";

type Step = "select" | "active" | "done";

const sel: React.CSSProperties = {
  display: "block", width: "100%", padding: "8px 10px",
  border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 16, fontSize: 14,
};
const btn: React.CSSProperties = {
  padding: "12px 24px", background: "#3b82f6", color: "white",
  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15,
};

export function Quiz() {
  const [topics, setTopics] = useState<Record<string, string[]>>({});
  const [subject, setSubject] = useState("ICT");
  const [subtopic, setSubtopic] = useState("");
  const [count, setCount] = useState(10);
  const [step, setStep] = useState<Step>("select");
  const [session, setSession] = useState<QuizSessionData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTopics().then((t) => {
      setTopics(t);
      const firstSubject = Object.keys(t)[0] ?? "ICT";
      setSubject(firstSubject);
      setSubtopic(t[firstSubject]?.[0] ?? "");
    });
  }, []);

  useEffect(() => {
    setSubtopic(topics[subject]?.[0] ?? "");
  }, [subject, topics]);

  async function handleStart() {
    setError(null);
    setLoading(true);
    try {
      const s = await startQuiz(subject, subtopic, count);
      setSession(s);
      setCurrentQ(0);
      setScore(0);
      setStep("active");
    } catch {
      setError("Failed to generate quiz. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswered(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (session && currentQ + 1 >= session.questions.length) setStep("done");
      else setCurrentQ((q) => q + 1);
    }, 2500);
  }

  if (step === "select") {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ marginBottom: 24 }}>Start a Quiz Session</h1>
        {error && <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Subject</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} style={sel}>
          {Object.keys(topics).map((s) => <option key={s}>{s}</option>)}
        </select>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Subtopic</label>
        <select value={subtopic} onChange={(e) => setSubtopic(e.target.value)} style={sel}>
          {(topics[subject] ?? []).map((t) => <option key={t}>{t}</option>)}
        </select>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Number of Questions</label>
        <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={sel}>
          {[5, 10, 20].map((n) => <option key={n}>{n}</option>)}
        </select>
        <button onClick={handleStart} disabled={loading || !subtopic} style={btn}>
          {loading ? "Generating questions…" : "Start Quiz →"}
        </button>
      </div>
    );
  }

  if (step === "done") {
    const pct = Math.round((score / (session?.questions.length ?? 1)) * 100);
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <h1 style={{ marginBottom: 12 }}>Session Complete!</h1>
        <p style={{ fontSize: 48, fontWeight: 700, color: pct >= 60 ? "#10b981" : "#ef4444" }}>
          {score} / {session?.questions.length}
        </p>
        <p style={{ color: "#6b7280", marginBottom: 32 }}>{pct}% accuracy</p>
        <button onClick={() => setStep("select")} style={btn}>New Session →</button>
      </div>
    );
  }

  const q = session!.questions[currentQ];
  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ marginBottom: 16 }}>{session!.subject} — {session!.subtopic}</h2>
      <p style={{ color: "#6b7280", marginBottom: 16 }}>Score: {score} / {currentQ}</p>
      <QuizCard
        key={q.id}
        sessionId={session!.id}
        question={q}
        questionNumber={currentQ + 1}
        total={session!.questions.length}
        onAnswered={handleAnswered}
      />
    </div>
  );
}
