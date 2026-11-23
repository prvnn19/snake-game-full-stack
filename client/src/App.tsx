import { useCallback, useEffect, useRef, useState } from "react";
import { GameBoard } from "./components/GameBoard";
import { Leaderboard } from "./components/Leaderboard";
import { SettingsPanel } from "./components/SettingsPanel";
import {
  advanceGame,
  changeDirection,
  createInitialState,
  DEFAULT_SETTINGS,
  getTickDelay
} from "./game/engine";
import type {
  Direction,
  GameSettings,
  GameState
} from "./game/engine";
import { getScores, saveScore } from "./services/scoreApi";
import type { ScoreEntry } from "./services/scoreApi";
import "./App.css";

const settingsStorageKey = "snake-game-settings";
const playerStorageKey = "snake-game-player-name";
const highScoreStorageKey = "snake-game-high-score";

const keyboardDirections: Record<string, Direction> = {
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right"
};

function loadSettings(): GameSettings {
  try {
    const savedValue = localStorage.getItem(settingsStorageKey);

    if (!savedValue) {
      return { ...DEFAULT_SETTINGS };
    }

    const savedSettings = JSON.parse(savedValue) as Partial<GameSettings>;

    if (
      Number.isInteger(savedSettings.cols) &&
      savedSettings.cols! >= 10 &&
      savedSettings.cols! <= 40 &&
      Number.isInteger(savedSettings.rows) &&
      savedSettings.rows! >= 10 &&
      savedSettings.rows! <= 40 &&
      Number.isInteger(savedSettings.baseSpeedMs) &&
      savedSettings.baseSpeedMs! >= 55 &&
      savedSettings.baseSpeedMs! <= 250
    ) {
      return {
        cols: savedSettings.cols!,
        rows: savedSettings.rows!,
        baseSpeedMs: savedSettings.baseSpeedMs!
      };
    }
  } catch {
    // Default settings are used if saved browser data is invalid.
  }

  return { ...DEFAULT_SETTINGS };
}

function loadHighScore(): number {
  const storedValue = Number(localStorage.getItem(highScoreStorageKey));
  return Number.isFinite(storedValue) && storedValue >= 0 ? storedValue : 0;
}

const initialSettings = loadSettings();

function App() {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(initialSettings.cols, initialSettings.rows)
  );
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem(playerStorageKey) ?? ""
  );
  const [highScore, setHighScore] = useState(loadHighScore);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const gameRunId = useRef(0);
  const submittedGameRunId = useRef<number | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setIsLoadingScores(true);
    setScoreError(null);

    try {
      setScores(await getScores());
    } catch (error) {
      setScoreError(
        error instanceof Error ? error.message : "Unable to contact the API."
      );
    } finally {
      setIsLoadingScores(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(playerStorageKey, playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem(highScoreStorageKey, String(highScore));
  }, [highScore]);

  useEffect(() => {
    setHighScore((currentHighScore) =>
      Math.max(currentHighScore, gameState.score)
    );
  }, [gameState.score]);

  const tickDelay = getTickDelay(settings.baseSpeedMs, gameState.score);

  useEffect(() => {
    if (gameState.status !== "playing") {
      return;
    }

    const timerId = window.setInterval(() => {
      setGameState((currentState) =>
        advanceGame(currentState, settings.cols, settings.rows)
      );
    }, tickDelay);

    return () => window.clearInterval(timerId);
  }, [
    gameState.status,
    settings.cols,
    settings.rows,
    tickDelay
  ]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const requestedDirection = keyboardDirections[event.key.toLowerCase()];

      if (!requestedDirection) {
        return;
      }

      event.preventDefault();

      setGameState((currentState) =>
        changeDirection(currentState, requestedDirection)
      );
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const gameFinished =
      gameState.status === "gameOver" || gameState.status === "won";

    if (!gameFinished) {
      return;
    }

    const currentRunId = gameRunId.current;

    if (submittedGameRunId.current === currentRunId) {
      return;
    }

    submittedGameRunId.current = currentRunId;

    async function submitCompletedGame() {
      try {
        await saveScore({
          playerName: playerName.trim() || "Anonymous",
          score: gameState.score,
          cols: settings.cols,
          rows: settings.rows,
          speedMs: settings.baseSpeedMs
        });

        setSaveMessage("Score saved to the leaderboard.");
        await loadLeaderboard();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to save the score.";

        setSaveMessage(`Score was not saved: ${message}`);
      }
    }

    void submitCompletedGame();
  }, [
    gameState.score,
    gameState.status,
    loadLeaderboard,
    playerName,
    settings
  ]);

  function resetGame(status: "ready" | "playing" = "ready") {
    gameRunId.current += 1;
    submittedGameRunId.current = null;
    setSaveMessage(null);

    setGameState({
      ...createInitialState(settings.cols, settings.rows),
      status
    });
  }

  function handleSettingsChange(nextSettings: GameSettings) {
    gameRunId.current += 1;
    submittedGameRunId.current = null;
    setSaveMessage(null);
    setSettings(nextSettings);

    setGameState({
      ...createInitialState(nextSettings.cols, nextSettings.rows),
      status: "ready"
    });
  }

  function handleStartOrResume() {
    if (gameState.status === "ready" || gameState.status === "paused") {
      setGameState((currentState) => ({
        ...currentState,
        status: "playing"
      }));
      return;
    }

    resetGame("playing");
  }

  function handlePauseOrResume() {
    setGameState((currentState) => ({
      ...currentState,
      status: currentState.status === "playing" ? "paused" : "playing"
    }));
  }

  function handleDirectionChange(direction: Direction) {
    setGameState((currentState) =>
      changeDirection(currentState, direction)
    );
  }

  const canPause =
    gameState.status === "playing" || gameState.status === "paused";

  const startButtonText =
    gameState.status === "paused"
      ? "Resume game"
      : gameState.status === "gameOver" || gameState.status === "won"
        ? "New game"
        : "Start game";

  const gameMessage =
    gameState.status === "gameOver"
      ? "Game over!"
      : gameState.status === "won"
        ? "You filled the entire board!"
        : gameState.status === "paused"
          ? "Game paused"
          : "Use arrow keys, WASD, or the on-screen buttons to move.";

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Classic arcade game</p>
        <h1>Snake</h1>
        <p>Eat food, grow longer, and avoid every collision.</p>
      </header>

      <div className="app-layout">
        <section className="game-panel">
          <div className="score-bar">
            <div>
              <span>Score</span>
              <strong>{gameState.score}</strong>
            </div>
            <div>
              <span>Best</span>
              <strong>{highScore}</strong>
            </div>
            <div>
              <span>Speed</span>
              <strong>{tickDelay} ms</strong>
            </div>
          </div>

          <p className="game-status" aria-live="polite">
            {gameMessage}
          </p>

          <div className="action-buttons">
            <button type="button" onClick={handleStartOrResume}>
              {startButtonText}
            </button>

            <button
              type="button"
              onClick={handlePauseOrResume}
              disabled={!canPause}
            >
              {gameState.status === "paused" ? "Resume" : "Pause"}
            </button>

            <button type="button" onClick={() => resetGame("playing")}>
              Restart
            </button>
          </div>

          <GameBoard
            gameState={gameState}
            settings={settings}
            onDirectionChange={handleDirectionChange}
          />

          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </section>

        <aside className="sidebar">
          <SettingsPanel
            settings={settings}
            playerName={playerName}
            onSettingsChange={handleSettingsChange}
            onPlayerNameChange={setPlayerName}
          />

          <Leaderboard
            scores={scores}
            isLoading={isLoadingScores}
            error={scoreError}
            onRefresh={() => void loadLeaderboard()}
          />
        </aside>
      </div>
    </main>
  );
}

export default App;