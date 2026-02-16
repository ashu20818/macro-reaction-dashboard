const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchStats(indicator: string) {
  const res = await fetch(`${API_BASE}/api/stats?indicator=${encodeURIComponent(indicator)}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchScatter(indicator: string, market: string, horizon: string) {
  const params = new URLSearchParams({ indicator, market, horizon });
  const res = await fetch(`${API_BASE}/api/scatter?${params}`);
  if (!res.ok) throw new Error("Failed to fetch scatter data");
  return res.json();
}

export async function fetchConditional(indicator: string, horizon: string) {
  const params = new URLSearchParams({ indicator, horizon });
  const res = await fetch(`${API_BASE}/api/conditional?${params}`);
  if (!res.ok) throw new Error("Failed to fetch conditional data");
  return res.json();
}

export async function fetchPath(indicator: string, market: string) {
  const params = new URLSearchParams({ indicator, market });
  const res = await fetch(`${API_BASE}/api/path?${params}`);
  if (!res.ok) throw new Error("Failed to fetch path data");
  return res.json();
}

export async function fetchHistogram(indicator: string) {
  const res = await fetch(`${API_BASE}/api/histogram?indicator=${encodeURIComponent(indicator)}`);
  if (!res.ok) throw new Error("Failed to fetch histogram data");
  return res.json();
}
