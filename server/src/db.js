const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "..", "data");

fs.mkdirSync(dataDirectory, { recursive: true });

const databasePath = path.join(dataDirectory, "snake.db");
const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    rows INTEGER NOT NULL,
    speed_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;