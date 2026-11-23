require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/scores", (request, response) => {
  const requestedLimit = Number(request.query.limit ?? 10);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 50)
    : 10;

  const scores = db
    .prepare(`
      SELECT
        id,
        player_name AS playerName,
        score,
        cols,
        rows,
        speed_ms AS speedMs,
        created_at AS createdAt
      FROM scores
      ORDER BY score DESC, created_at ASC
      LIMIT ?
    `)
    .all(limit);

  response.json(scores);
});

app.post("/api/scores", (request, response) => {
  const { playerName, score, cols, rows, speedMs } = request.body;
  const name = typeof playerName === "string" ? playerName.trim() : "";

  const validRequest =
    name.length >= 1 &&
    name.length <= 20 &&
    Number.isInteger(score) &&
    score >= 0 &&
    Number.isInteger(cols) &&
    cols >= 10 &&
    cols <= 40 &&
    Number.isInteger(rows) &&
    rows >= 10 &&
    rows <= 40 &&
    Number.isInteger(speedMs) &&
    speedMs >= 55 &&
    speedMs <= 250;

  if (!validRequest) {
    return response.status(400).json({
      error: "Invalid score submission."
    });
  }

  const result = db
    .prepare(`
      INSERT INTO scores (player_name, score, cols, rows, speed_ms)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(name, score, cols, rows, speedMs);

  response.status(201).json({
    id: Number(result.lastInsertRowid)
  });
});

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Snake API running at http://localhost:${port}`);
});