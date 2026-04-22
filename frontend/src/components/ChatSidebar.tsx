import { useEffect, useRef, useState } from "react";
import { useStream } from "../hooks/useStream";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const PROMPT_CHIPS = [
  "Explain OSI model simply",
  "5 Bangla grammar rules for NTRCA",
  "How to convert binary to hex?",
  "Important SQL queries for exam",
];

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export function ChatSidebar({ isOpen, onToggle }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { text, loading, startStream } = useStream();
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<string>("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, text]);

  useEffect(() => {
    if (!loading && text && text !== pendingRef.current) {
      pendingRef.current = text;
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    }
  }, [loading, text]);

  function send(msg?: string) {
    const m = (msg ?? input).trim();
    if (!m || loading) return;
    setInput("");
    pendingRef.current = "";
    setMessages((prev) => [...prev, { role: "user", content: m }]);
    startStream(`/api/stream/chat?message=${encodeURIComponent(m)}`);
  }

  const displayMessages: Message[] = [
    ...messages,
    ...(loading ? [{ role: "assistant" as const, content: text || "…" }] : []),
  ];

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="chat-header">
        {isOpen && (
          <div className="chat-header-info">
            <div className="chat-dot" />
            <div>
              <div className="chat-title">Claude Assistant</div>
              <div className="chat-meta">NTRCA context loaded</div>
            </div>
          </div>
        )}
        <button className="chat-toggle-btn" onClick={onToggle} style={isOpen ? {} : { margin: "0 auto" }}>
          {isOpen ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Messages */}
          <div className="chat-messages">
            {displayMessages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-heading">Try asking</div>
                {PROMPT_CHIPS.map((p) => (
                  <button key={p} className="chat-prompt-chip" onClick={() => send(p)}>
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              displayMessages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  <div className="chat-bubble">{m.content}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything…"
              rows={1}
            />
            <button
              className="chat-send"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              <SendIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
