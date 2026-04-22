import { useEffect, useState } from "react";
import { startQuiz, type QuizSessionData } from "../api/quiz";
import { getTopics } from "../api/topics";
import { QuizCard } from "../components/QuizCard";

type Phase = "select" | "active" | "done";

const SUBJECT_EMOJIS: Record<string, string> = {
  ICT: "⚡",
  Bangla: "বাং",
  English: "En",
  Math: "∑",
  GK: "◉",
};

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function Quiz() {
  const [topics, setTopics] = useState<Record<string, string[]>>({});
  const [subject, setSubject] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState<Phase>("select");
  const [session, setSession] = useState<QuizSessionData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTopics().then((t) => {
      setTopics(t);
      const first = Object.keys(t)[0] ?? "ICT";
      setSubject(first);
      setSubtopic(t[first]?.[0] ?? "");
    });
  }, []);

  useEffect(() => {
    setSubtopic(topics[subject]?.[0] ?? "");
  }, [subject, topics]);

  async function handleStart() {
    if (!subject || !subtopic) return;
    setError(null);
    setLoading(true);
    try {
      const s = await startQuiz(subject, subtopic, count);
      setSession(s);
      setCurrentQ(0);
      setScore(0);
      setPhase("active");
    } catch {
      setError("Failed to generate quiz. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswered(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (session && currentQ + 1 >= session.questions.length) {
        setPhase("done");
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 2500);
  }

  /* ── Select Phase ── */
  if (phase === "select") {
    const topicList = topics[subject] ?? [];
    const loaded = Object.keys(topics).length > 0;

    return (
      <div className="page">
        <div className="page-header animate-in">
          <div className="page-header-date">Practice Session</div>
          <h1 className="display-xl">Start a Quiz</h1>
          <p className="text-muted" style={{ marginTop: 6, fontSize: 14 }}>
            Claude will generate NTRCA-style questions tailored to your topic.
          </p>
        </div>

        {error && (
          <div
            className="card animate-in"
            style={{
              background: "var(--red-bg)",
              border: "1px solid rgba(248,113,113,0.25)",
              color: "var(--red)",
              padding: "14px 18px",
              marginBottom: 24,
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1 — Subject */}
        <div className="animate-in animate-in-delay-1">
          <div className="caption" style={{ marginBottom: 12 }}>Step 1 — Choose Subject</div>
          <div className="subject-grid">
            {loaded
              ? Object.entries(topics).map(([sub, subs]) => (
                  <button
                    key={sub}
                    className={`subject-card${subject === sub ? " selected" : ""}`}
                    onClick={() => setSubject(sub)}
                  >
                    <div className="subject-card-icon">{SUBJECT_EMOJIS[sub] ?? sub.slice(0, 2)}</div>
                    <div className="subject-card-name">{sub}</div>
                    <div className="subject-card-count">{subs.length} topics</div>
                  </button>
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 96,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      animation: `pulse 1.4s ease ${i * 100}ms infinite alternate`,
                    }}
                  />
                ))}
          </div>
        </div>

        {/* Step 2 — Subtopic */}
        {subject && topicList.length > 0 && (
          <div className="animate-in" style={{ marginBottom: 0 }}>
            <div className="caption" style={{ marginBottom: 12 }}>Step 2 — Choose Subtopic</div>
            <div className="subtopic-grid">
              {topicList.map((t) => (
                <button
                  key={t}
                  className={`subtopic-chip${subtopic === t ? " selected" : ""}`}
                  onClick={() => setSubtopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Count + Start */}
        {subtopic && (
          <div className="animate-in" style={{ marginTop: 28 }}>
            <div className="caption" style={{ marginBottom: 12 }}>Step 3 — Number of Questions</div>
            <div className="count-options" style={{ marginBottom: 32 }}>
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  className={`count-option${count === n ? " selected" : ""}`}
                  onClick={() => setCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleStart}
              disabled={loading || !subtopic}
            >
              {loading ? (
                <>Generating questions…</>
              ) : (
                <>Generate {count} Questions <ArrowRight /></>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Done Phase ── */
  if (phase === "done") {
    const total = session?.questions.length ?? 1;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;
    const r = 52;
    const circ = 2 * Math.PI * r;
    const fill = circ * (pct / 100);

    return (
      <div className="page">
        <div className="done-screen">
          <div className="done-score-ring">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-3)" strokeWidth="8" />
              <circle
                cx="65" cy="65" r={r}
                fill="none"
                stroke={passed ? "var(--green)" : "var(--red)"}
                strokeWidth="8"
                strokeDasharray={`${fill} ${circ - fill}`}
                strokeLinecap="round"
                transform="rotate(-90 65 65)"
                style={{ transition: "stroke-dasharray 800ms cubic-bezier(0.4,0,0.2,1)" }}
              />
              <text x="65" y="60" textAnchor="middle" fontSize="13" fontFamily="DM Mono" fill="var(--text-3)" letterSpacing="0.08em">SCORE</text>
              <text x="65" y="82" textAnchor="middle" fontSize="22" fontWeight="500" fontFamily="DM Mono" fill={passed ? "var(--green)" : "var(--red)"}>
                {pct}%
              </text>
            </svg>
          </div>

          <div className="done-score-number mono" style={{ color: passed ? "var(--green)" : "var(--red)" }}>
            {score} / {total}
          </div>
          <div className="done-score-label">
            {session?.subject} — {session?.subtopic}
          </div>

          <p
            className="text-muted"
            style={{ fontSize: 14, maxWidth: 360, margin: "0 auto 36px" }}
          >
            {passed
              ? "Great work! Keep this momentum going with your next session."
              : "Below 60% — add this topic to your weak areas drill list."}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => setPhase("select")}>
              New Session <ArrowRight />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => window.location.href = "/progress"}>
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active Phase ── */
  const q = session!.questions[currentQ];
  const pct = ((currentQ) / session!.questions.length) * 100;

  return (
    <div className="page">
      <div className="animate-in" style={{ marginBottom: 0 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div className="caption" style={{ marginBottom: 3 }}>{session!.subject}</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{session!.subtopic}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="caption" style={{ marginBottom: 3 }}>Score</div>
            <div className="mono" style={{ fontSize: 15, fontWeight: 500, color: "var(--green)" }}>
              {score} / {currentQ}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="quiz-progress-wrap">
          <div className="quiz-progress-meta">
            <span className="text-faint" style={{ fontSize: 12 }}>
              Question {currentQ + 1} of {session!.questions.length}
            </span>
            <span className="mono text-faint" style={{ fontSize: 11 }}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <QuizCard
          key={q.id}
          sessionId={session!.id}
          question={q}
          questionNumber={currentQ + 1}
          total={session!.questions.length}
          onAnswered={handleAnswered}
        />
      </div>
    </div>
  );
}
