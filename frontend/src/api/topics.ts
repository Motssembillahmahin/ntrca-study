const BASE = "/api";

export async function getTopics(): Promise<Record<string, string[]>> {
  const res = await fetch(`${BASE}/topics`);
  if (!res.ok) throw new Error("Failed to fetch topics");
  return res.json();
}
