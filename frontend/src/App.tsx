import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChatSidebar } from "./components/ChatSidebar";
import { Dashboard } from "./pages/Dashboard";
import { Progress } from "./pages/Progress";
import { Quiz } from "./pages/Quiz";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ChatSidebar />
      </div>
    </BrowserRouter>
  );
}
