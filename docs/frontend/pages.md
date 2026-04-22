# Frontend — Pages

The frontend is a React 18 + Vite + TypeScript SPA with React Router v7. Three main pages, all under `frontend/src/pages/`.

---

## Dashboard (`/`)

`src/pages/Dashboard.tsx`

Landing page showing today's study status and high-level progress.

**What it shows**
- Overall accuracy as a `ProgressRing` component
- Per-subject accuracy rings (ICT, Bangla, English, Math, GK)
- Weak area alerts — subtopics below 60% accuracy with a link to quiz that topic
- Quick-start buttons: "Start Quiz" and "View Progress"

**Data source**

Calls `getProgress()` from `src/api/progress.ts` on mount. Derives per-subject accuracy by grouping `topic_stats` by subject and averaging.

---

## Quiz (`/quiz`)

`src/pages/Quiz.tsx`

Three-phase flow managed by a `phase` state variable:

### Phase 1 — Select

Dropdown to pick subject and subtopic (populated from `GET /topics`), and a question count slider (5–20). Clicking "Start Quiz" calls `POST /quiz/start` and transitions to the active phase.

### Phase 2 — Active

Renders one `QuizCard` at a time. After the user selects an answer:
1. `POST /quiz/{session_id}/answer` is called immediately
2. The card highlights correct/wrong options
3. A streaming explanation appears below via `GET /stream/explain` (SSE)
4. After 2.5 seconds the next question is shown automatically

A progress bar at the top shows current question / total.

### Phase 3 — Done

Shows the final score (`correct / total`), accuracy percentage, and buttons to retake or return to Dashboard.

---

## Progress (`/progress`)

`src/pages/Progress.tsx`

Full study analytics page.

**What it shows**
- Summary row: total questions answered, total correct, overall accuracy
- Bar chart (Recharts `BarChart`) — per-subtopic accuracy across all sessions
- Weak areas list — subtopics flagged below 60% threshold, sorted by accuracy ascending, with a "Practice" link that jumps to Quiz with that subtopic pre-selected
- Recent sessions table — date, subject, subtopic, score

**Data source**

Calls `getProgress()` on mount. All sections derived from `ProgressStats`.
