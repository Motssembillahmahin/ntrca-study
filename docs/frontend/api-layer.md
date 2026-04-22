# Frontend — API Layer

All server communication goes through `frontend/src/api/` and `frontend/src/hooks/useStream.ts`.

The Vite dev server proxies `/api/*` → `http://localhost:8000` (stripping the `/api` prefix), so all fetch calls use `/api` as the base and work without CORS issues in development.

---

## API Modules

### `src/api/quiz.ts`

```typescript
startQuiz(subject, subtopic, count): Promise<QuizSessionData>
// POST /api/quiz/start

submitAnswer(sessionId, questionId, answerIdx): Promise<AnswerResult>
// POST /api/quiz/{sessionId}/answer
```

**Types**
```typescript
interface QuestionData {
  id: number;
  question_text: string;
  options: string[];
  correct_idx: number;
  explanation: string;
}

interface QuizSessionData {
  id: number;
  subject: string;
  subtopic: string;
  total_questions: number;
  correct_count: number;
  questions: QuestionData[];
}

interface AnswerResult {
  is_correct: boolean;
  correct_idx: number;
  explanation: string;
}
```

---

### `src/api/progress.ts`

```typescript
getProgress(): Promise<ProgressData>
// GET /api/progress
```

**Types**
```typescript
interface TopicStat {
  subject: string;
  subtopic: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface ProgressData {
  total_questions: number;
  total_correct: number;
  overall_accuracy: number;
  topic_stats: TopicStat[];
  weak_areas: { subject: string; subtopic: string; accuracy: number }[];
}
```

---

### `src/api/topics.ts`

```typescript
getTopics(): Promise<Record<string, string[]>>
// GET /api/topics
```

---

## useStream Hook

`src/hooks/useStream.ts`

Custom hook that manages a browser `EventSource` connection for SSE streams.

**Signature**
```typescript
function useStream(): {
  text: string;          // accumulated text so far
  loading: boolean;      // true while stream is open
  error: string | null;  // set if EventSource errors
  startStream: (url: string) => void;
  stop: () => void;
}
```

**Usage**
```typescript
const { text, loading, startStream } = useStream();

// start a stream
startStream(`/api/stream/explain?question_id=${id}&answer_idx=${idx}`);

// text updates in real time as chunks arrive
// loading becomes false when [DONE] is received
```

**Internals**

1. Closes any previous `EventSource` and resets state
2. Creates `new EventSource(url)`
3. On each `message` event: if data is `"[DONE]"` → close and set `loading=false`; otherwise append data to `text`
4. On `error` event: set error message and close

The `startStream` callback is stable (wrapped in `useCallback`) so it is safe to use as a `useEffect` dependency.

---

## Vite Proxy Config

`frontend/vite.config.ts`

```typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
}
```

In production (Docker), nginx handles the same proxy so the frontend bundle doesn't need to change.
