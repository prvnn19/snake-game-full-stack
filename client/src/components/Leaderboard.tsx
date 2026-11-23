import type { ScoreEntry } from "../services/scoreApi";

type LeaderboardProps = {
  scores: ScoreEntry[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function Leaderboard({
  scores,
  isLoading,
  error,
  onRefresh
}: LeaderboardProps) {
  return (
    <section className="leaderboard">
      <div className="section-heading">
        <h2>Top scores</h2>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="api-error" role="alert">
          Could not load scores: {error}
        </p>
      )}

      {!isLoading && !error && scores.length === 0 && (
        <p className="empty-scores">No scores saved yet. Be the first!</p>
      )}

      {scores.length > 0 && (
        <ol className="score-list">
          {scores.map((entry) => (
            <li key={entry.id}>
              <span className="score-player">{entry.playerName}</span>
              <span className="score-value">{entry.score}</span>
              <small>
                {entry.cols} × {entry.rows} grid
              </small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}