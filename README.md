# Snake Game

A full-stack, browser-based Snake game built as an individual Software Engineering project. The game supports configurable board sizes, adjustable starting speed, keyboard and touch controls, collision detection, score tracking, and a persistent top-scores leaderboard.

## Features

- Classic Snake movement with wall and self-collision detection
- Food collection, snake growth, and score increases
- Increasing difficulty as the score rises
- Configurable grid width and height (10–40 cells)
- Slow, Normal, and Fast starting speeds
- Arrow keys, WASD, and on-screen touch controls
- Pause, resume, restart, local best score, and saved player settings
- Express API backed by SQLite for the top-scores leaderboard
- Responsive interface for desktop and mobile layouts

## Technology

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express
- **Database:** SQLite using `better-sqlite3`

## Run locally on Windows

Use two PowerShell terminals. If PowerShell blocks the `npm` script, use `npm.cmd` as shown below.

### 1. Start the API

```powershell
cd server
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

The API listens on `http://localhost:4000`. SQLite creates its database under `server/data/` when the server starts.

### 2. Start the web app

In a second terminal:

```powershell
cd client
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

Open the local URL printed by Vite. The default frontend origin is `http://localhost:5173`. If Vite uses another port, update `FRONTEND_URL` in `server/.env` to that exact origin and restart the API.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check that the API is running |
| `GET` | `/api/scores?limit=10` | Retrieve the highest scores |
| `POST` | `/api/scores` | Validate and save a completed game |

Score submissions include `playerName`, `score`, `cols`, `rows`, and `speedMs`. The server validates these fields before saving them.

The coursework Word and PDF reports are kept separately and are not included in this public source repository.

## Verification status

The frontend production build and direct API health and score-list checks were recorded as successful during development. Browser gameplay, completed-score submission, persistence across server restarts, and the post-configuration CORS retest still need end-to-end verification.
