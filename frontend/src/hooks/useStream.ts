import { useCallback, useRef, useState } from "react";

export function useStream() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const startStream = useCallback((url: string) => {
    if (esRef.current) esRef.current.close();
    setText("");
    setError(null);
    setLoading(true);

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        setLoading(false);
        es.close();
        return;
      }
      setText((prev) => prev + e.data);
    };

    es.onerror = () => {
      setError("Stream connection failed");
      setLoading(false);
      es.close();
    };
  }, []);

  const stop = useCallback(() => {
    esRef.current?.close();
    setLoading(false);
  }, []);

  return { text, loading, error, startStream, stop };
}
