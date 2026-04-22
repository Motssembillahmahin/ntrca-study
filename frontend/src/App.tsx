import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChatSidebar } from "./components/ChatSidebar";
import { NavSidebar } from "./components/NavSidebar";
import { Dashboard } from "./pages/Dashboard";
import { Progress } from "./pages/Progress";
import { Quiz } from "./pages/Quiz";

export default function App() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavSidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ChatSidebar isOpen={chatOpen} onToggle={() => setChatOpen((v) => !v)} />
      </div>
    </BrowserRouter>
  );
}
