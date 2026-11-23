export type ScoreEntry = {
  id: number;
  playerName: string;
  score: number;
  cols: number;
  rows: number;
  speedMs: number;
  createdAt: string;
};

export type ScoreSubmission = {
  playerName: string;
  score: number;
  cols: number;
  rows: number;
  speedMs: number;
};

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "The request failed.";
  } catch {
    return "The request failed.";
  }
}

export async function getScores(): Promise<ScoreEntry[]> {
  const response = await fetch(`${apiBaseUrl}/api/scores?limit=10`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<ScoreEntry[]>;
}

export async function saveScore(
  score: ScoreSubmission
): Promise<{ id: number }> {
  const response = await fetch(`${apiBaseUrl}/api/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(score)
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<{ id: number }>;
}