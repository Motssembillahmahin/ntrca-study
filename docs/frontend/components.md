# Frontend — Components

Reusable components in `frontend/src/components/`.

---

## QuizCard

`src/components/QuizCard.tsx`

Renders a single MCQ question during an active quiz session.

**Props**
```typescript
interface QuizCardProps {
  question: QuestionData;
  sessionId: number;
  onAnswered: (result: AnswerResult) => void;
}
```

**Behavior**
- Displays `question_text` and four option buttons (A–D)
- On click: calls `submitAnswer()`, disables all options, highlights correct (green) and wrong (red) choices
- Streams a Claude explanation via `useStream` pointing at `GET /stream/explain`
- Calls `onAnswered` with the result so the parent page can advance to the next question

**States**
- `idle` — waiting for user to pick an option
- `answered` — options locked, explanation streaming

---

## ChatSidebar

`src/components/ChatSidebar.tsx`

Persistent collapsible study chat panel, available on all pages.

**Behavior**
- Renders a message thread (user messages right-aligned, assistant left-aligned)
- On submit: starts a `GET /stream/chat` SSE stream
- Streams the assistant reply in real time into the latest message bubble
- When the stream ends (`loading` transitions from `true` to `false`), the completed assistant message is committed to the local message list
- Input is disabled during streaming

**Stream lifecycle**
```
user submits → add user msg to list → startStream(url) → chunks append to preview
→ [DONE] → loading=false → useEffect: commit preview to message list → clear preview
```

**Local state only** — the message thread is not fetched from the server. History is maintained in component state for the session. The server persists messages to the database independently (done inside the stream router after the full response is assembled).

---

## ProgressRing

`src/components/ProgressRing.tsx`

SVG circular progress indicator.

**Props**
```typescript
interface ProgressRingProps {
  value: number;     // 0.0 – 1.0
  size?: number;     // diameter in px, default 80
  label?: string;    // text shown below the ring
  color?: string;    // stroke color, defaults to theme blue
}
```

Renders two concentric circles: a grey background track and a colored arc representing the `value` fraction. The percentage is displayed as text in the center.

Used on the Dashboard for overall accuracy and per-subject breakdowns.
