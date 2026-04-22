const BASE = "/api";

export interface TopicStat {
  subject: string;
  subtopic: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface ProgressData {
  total_questions: number;
  total_correct: number;
  overall_accuracy: number;
  topic_stats: TopicStat[];
  weak_areas: { subject: string; subtopic: string; accuracy: number }[];
}

export async function getProgress(): Promise<ProgressData> {
  const res = await fetch(`${BASE}/progress`);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}
