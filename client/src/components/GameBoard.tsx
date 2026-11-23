import type {
  Direction,
  GameSettings,
  GameState
} from "../game/engine";

type GameBoardProps = {
  gameState: GameState;
  settings: GameSettings;
  onDirectionChange: (direction: Direction) => void;
};

const directions: { direction: Direction; label: string; symbol: string }[] = [
  { direction: "up", label: "Move up", symbol: "↑" },
  { direction: "left", label: "Move left", symbol: "←" },
  { direction: "down", label: "Move down", symbol: "↓" },
  { direction: "right", label: "Move right", symbol: "→" }
];

export function GameBoard({
  gameState,
  settings,
  onDirectionChange
}: GameBoardProps) {
  const { cols, rows } = settings;
  const { snake, food } = gameState;

  const snakeCells = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const head = snake[0];

  const cells = Array.from({ length: cols * rows }, (_, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);
    const key = `${x},${y}`;

    const isHead = head.x === x && head.y === y;
    const isFood = food?.x === x && food.y === y;

    let className = "game-cell";

    if (isHead) {
      className += " snake-head";
    } else if (snakeCells.has(key)) {
      className += " snake-body";
    } else if (isFood) {
      className += " food";
    }

    return <div className={className} key={key} />;
  });

  return (
    <section className="game-area" aria-label="Snake game board">
      <div
        className="game-board"
        style={{gridTemplateColumns: `repeat(${cols}, 1fr)`,
		aspectRatio: `${cols} / ${rows}`}}
      >
        {cells}
      </div>

      <div className="touch-controls" aria-label="Direction controls">
        <button
          type="button"
          onClick={() => onDirectionChange("up")}
          aria-label={directions[0].label}
        >
          {directions[0].symbol}
        </button>

        <div>
          <button
            type="button"
            onClick={() => onDirectionChange("left")}
            aria-label={directions[1].label}
          >
            {directions[1].symbol}
          </button>

          <button
            type="button"
            onClick={() => onDirectionChange("down")}
            aria-label={directions[2].label}
          >
            {directions[2].symbol}
          </button>

          <button
            type="button"
            onClick={() => onDirectionChange("right")}
            aria-label={directions[3].label}
          >
            {directions[3].symbol}
          </button>
        </div>
      </div>
    </section>
  );
}