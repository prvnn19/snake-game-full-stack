export type Point = {
  x: number;
  y: number;
};

export type Direction = "up" | "down" | "left" | "right";

export type GameStatus = "ready" | "playing" | "paused" | "gameOver" | "won";

export type GameSettings = {
  cols: number;
  rows: number;
  baseSpeedMs: number;
};

export type GameState = {
  snake: Point[];
  food: Point | null;
  direction: Direction;
  score: number;
  status: GameStatus;
};

export const DEFAULT_SETTINGS: GameSettings = {
  cols: 20,
  rows: 20,
  baseSpeedMs: 130
};

const directionChanges: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function samePoint(first: Point, second: Point): boolean {
  return first.x === second.x && first.y === second.y;
}

export function isOppositeDirection(
  current: Direction,
  requested: Direction
): boolean {
  return (
    (current === "up" && requested === "down") ||
    (current === "down" && requested === "up") ||
    (current === "left" && requested === "right") ||
    (current === "right" && requested === "left")
  );
}

export function placeFood(
  snake: Point[],
  cols: number,
  rows: number
): Point | null {
  const occupiedCells = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const availableCells: Point[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupiedCells.has(`${x},${y}`)) {
        availableCells.push({ x, y });
      }
    }
  }

  if (availableCells.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableCells.length);
  return availableCells[randomIndex];
}

export function createInitialState(cols: number, rows: number): GameState {
  const headX = Math.floor(cols / 2);
  const headY = Math.floor(rows / 2);

  const snake = [
    { x: headX, y: headY },
    { x: headX - 1, y: headY },
    { x: headX - 2, y: headY }
  ];

  return {
    snake,
    food: placeFood(snake, cols, rows),
    direction: "right",
    score: 0,
    status: "ready"
  };
}

export function changeDirection(
  state: GameState,
  requestedDirection: Direction
): GameState {
  if (isOppositeDirection(state.direction, requestedDirection)) {
    return state;
  }

  return {
    ...state,
    direction: requestedDirection
  };
}

export function getTickDelay(baseSpeedMs: number, score: number): number {
  const difficultyIncrease = Math.floor(score / 50) * 5;
  return Math.max(55, baseSpeedMs - difficultyIncrease);
}

export function advanceGame(
  state: GameState,
  cols: number,
  rows: number
): GameState {
  if (state.status !== "playing") {
    return state;
  }

  const movement = directionChanges[state.direction];
  const currentHead = state.snake[0];

  const newHead: Point = {
    x: currentHead.x + movement.x,
    y: currentHead.y + movement.y
  };

  const hitWall =
    newHead.x < 0 ||
    newHead.x >= cols ||
    newHead.y < 0 ||
    newHead.y >= rows;

  if (hitWall) {
    return { ...state, status: "gameOver" };
  }

  const ateFood = state.food !== null && samePoint(newHead, state.food);

  // On a normal move, the tail leaves its cell before collision is checked.
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitSelf = collisionBody.some((segment) => samePoint(segment, newHead));

  if (hitSelf) {
    return { ...state, status: "gameOver" };
  }

  const nextSnake = ateFood
    ? [newHead, ...state.snake]
    : [newHead, ...state.snake.slice(0, -1)];

  const nextScore = ateFood ? state.score + 10 : state.score;
  const nextFood = ateFood ? placeFood(nextSnake, cols, rows) : state.food;

  return {
    snake: nextSnake,
    food: nextFood,
    direction: state.direction,
    score: nextScore,
    status: nextFood === null ? "won" : "playing"
  };
}