# Werewords Online

A real-time multiplayer social deduction word game built with **React** (frontend) and **Go WebSockets** (backend).

## About the Game

Werewords is a word-guessing game where players work together to discover a secret **Magic Word** — but beware, a hidden **Werewolf** is trying to mislead everyone!

### Roles

| Role | Knows the Word? | Goal |
|------|-----------------|------|
| **Villager** | No | Guess the Magic Word, or find the Werewolf |
| **Werewolf** | Yes | Mislead the village without getting caught |
| **Seer** | Yes | Subtly guide the village toward the word |
| **Mayor** | Yes | Answers yes/no questions with tokens (any role can be Mayor) |

### How to Play

1. **Lobby** — Players join a room, mark ready, and start the game.
2. **Role Reveal** (8 seconds) — Each player secretly learns their role.
3. **Day Phase** (4 minutes) — Players ask yes/no questions. The Mayor responds with tokens: *Yes*, *No*, *Maybe*, *So Close*, *Way Off*, or *Correct*.
4. **Voting** — When time runs out, players vote on who they think is the Werewolf.
5. **Game Over** — Village wins if they guess the word (Mayor plays *Correct* token) or vote out the Werewolf. Werewolves win otherwise.

### Player Scaling

| Players | Werewolves | Seer | Villagers |
|---------|-----------|------|-----------|
| 3-5 | 1 | 1 | 1-3 |
| 6-10 | 2 | 1 | 3-7 |

---

## Architecture

```
Frontend (React + TypeScript + Vite)
    ↕ WebSocket (JSON messages)
Backend (Go + gorilla/websocket)
```

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Go 1.22+, gorilla/websocket
- **Protocol**: JSON over WebSocket with full state synchronization
- **Security**: Secret word and player roles are filtered server-side per player

---

## Prerequisites

- **Node.js** 18+ and npm
- **Go** 1.22+
- **Docker** (optional, for containerized deployment)

---

## Running Locally

### Option 1: Mock Mode (Frontend Only)

The quickest way to try the game — runs entirely in the browser with simulated bot players. No backend needed.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The game runs with 3 AI bots.

> **Note:** This uses the mock backend. In `services/game.ts`, ensure `USE_REAL_BACKEND = false` (this is the default).

---

### Option 2: Full Stack (Frontend + Go Backend)

For real multiplayer with multiple browser tabs or friends on the same network.

**Step 1 — Start the Go backend:**

```bash
cd server
go mod tidy
go run .
```

The server starts on [http://localhost:8080](http://localhost:8080) with the WebSocket at `ws://localhost:8080/ws`.

**Step 2 — Switch frontend to real backend:**

Edit `services/game.ts` and change the toggle:

```typescript
const USE_REAL_BACKEND = true;
```

**Step 3 — Start the frontend dev server:**

```bash
npm install
npm run dev
```

The Vite dev server starts on [http://localhost:3000](http://localhost:3000) and automatically proxies `/ws` requests to the Go backend on port 8080.

**Step 4 — Play!**

1. Open [http://localhost:3000](http://localhost:3000) in your first browser tab
2. Enter your name and click **Create Room**
3. Copy the room code (e.g. `WOLF-4821`) shown in the lobby
4. Open 2-3 more tabs, enter a name + the room code, click **Join Room**
5. All players click **Ready Up**, then **Start Game**

---

### Option 3: Docker

Build and run everything in a single container:

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). The Go server serves both the built frontend and the WebSocket endpoint.

---

## Deployment

The `Dockerfile` produces a single lightweight container (~25MB) that includes the compiled Go binary and the built frontend assets.

### Build the Production Image

```bash
docker build -t werewords .
docker run -p 8080:8080 werewords
```

### Fly.io

```bash
# Install flyctl: https://fly.io/docs/getting-started/installing-flyctl/

fly launch          # Creates fly.toml, detects Dockerfile
fly deploy          # Builds & deploys
```

### Railway

1. Push your code to GitHub
2. Connect the repo at [railway.app](https://railway.app)
3. Railway auto-detects the Dockerfile and deploys
4. The `PORT` environment variable is set automatically

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/werewords

# Deploy
gcloud run deploy werewords \
  --image gcr.io/YOUR_PROJECT_ID/werewords \
  --port 8080 \
  --allow-unauthenticated
```

### Render

1. Create a new **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. Set environment to **Docker**, port `8080`
4. Deploy

### Generic VPS (DigitalOcean, AWS EC2, etc.)

```bash
# On your server
git clone <your-repo>
cd werewords-online
docker compose up -d --build

# Optional: put behind nginx/caddy as reverse proxy for HTTPS
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP/WebSocket server port |
| `GEMINI_API_KEY` | — | Google Gemini API key for AI word generation (frontend mock mode only) |

---

## Project Structure

```
werewords-online/
├── App.tsx                  # Main app (phase-based rendering)
├── index.html               # Entry HTML with Tailwind CDN
├── index.tsx                # React root mount
├── types.ts                 # Shared TypeScript types & WebSocket protocol
├── constants.ts             # Token config, role descriptions, timing
├── vite.config.ts           # Vite config with WebSocket proxy
├── package.json
│
├── components/
│   ├── GameBoard.tsx        # Day phase UI (timer, tokens, questions)
│   └── ui/
│       ├── RoleCard.tsx     # Flip-to-reveal role card
│       └── Token.tsx        # Token buttons
│
├── services/
│   ├── game.ts              # Backend toggle (mock vs live)
│   ├── mockSocket.ts        # In-browser simulation with bots
│   ├── liveSocket.ts        # WebSocket client for Go backend
│   ├── geminiService.ts     # AI word generation (optional)
│   └── audioService.ts      # Sound effects
│
├── server/                  # Go backend
│   ├── main.go              # HTTP server & WebSocket endpoint
│   ├── hub.go               # Room registry & player routing
│   ├── client.go            # WebSocket connection handler
│   ├── room.go              # Game state machine & logic
│   ├── types.go             # Types matching frontend protocol
│   ├── words.go             # Secret word list
│   └── go.mod               # Go module definition
│
├── Dockerfile               # Multi-stage production build
├── docker-compose.yml       # One-command local deployment
├── .dockerignore
└── README.md
```

---

## WebSocket Protocol

### Client → Server

| Message | Payload | When |
|---------|---------|------|
| `JOIN_GAME` | `{ name: string, roomCode?: string }` | Login screen |
| `TOGGLE_READY` | — | Lobby |
| `START_GAME` | — | Lobby (all ready) |
| `SUBMIT_TOKEN` | `{ tokenType: string }` | Day phase (Mayor only) |
| `VOTE` | `{ targetId: string }` | Voting phase |
| `RESET_GAME` | — | Game over screen |

### Server → Client

| Message | Payload | Description |
|---------|---------|-------------|
| `STATE_UPDATE` | `GameState` | Full state sync (personalized per player) |
| `ERROR` | `{ message: string }` | Error notification |

The server sends **personalized state** to each player:
- `myPlayerId` is set to the receiving player's ID
- `secretWord` is only sent to Mayor, Werewolf, and Seer (empty string for Villagers)
- Other players' `role` fields are hidden during active game phases
- All roles and the word are revealed in the `GAME_OVER` phase

---

## License

MIT
