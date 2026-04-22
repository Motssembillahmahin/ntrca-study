import { useEffect, useRef, useState } from "react";
import { useStream } from "../hooks/useStream";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { text, loading, startStream } = useStream();
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<string>("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, text]);

  // When stream finishes, persist the assistant message
  useEffect(() => {
    if (!loading && text && text !== pendingRef.current) {
      pendingRef.current = text;
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    }
  }, [loading, text]);

  function handleSend() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    pendingRef.current = "";
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    startStream(`/api/stream/chat?message=${encodeURIComponent(msg)}`);
  }

  const displayMessages: Message[] = [
    ...messages,
    ...(loading ? [{ role: "assistant" as const, content: text || "…" }] : []),
  ];

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        borderLeft: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        background: "#fafafa",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 600,
          fontSize: 14,
          background: "#fff",
        }}
      >
        Ask Claude · NTRCA Assistant
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {displayMessages.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: 13, padding: "8px 4px" }}>
            Ask anything about NTRCA topics.
            <br />
            <br />
            e.g. "Explain OSI model simply"
            <br />
            "5 important Bangla grammar rules"
            <br />
            "How do I convert binary to hex?"
          </p>
        )}
        {displayMessages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#3b82f6" : "#fff",
              color: m.role === "user" ? "white" : "#111",
              border: m.role === "assistant" ? "1px solid #e5e7eb" : "none",
              padding: "8px 12px",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              maxWidth: "90%",
              fontSize: 13,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: 12,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 8,
          background: "#fff",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask anything…"
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: "8px 14px",
            background: loading || !input.trim() ? "#93c5fd" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: loading || !input.trim() ? "default" : "pointer",
            fontSize: 16,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
