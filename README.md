# Tragedy of the Commons Multiplayer (Phaser + Colyseus)

Monorepo with a Colyseus Node server and Phaser 3 client.

## Prereqs
- Node.js >= 18
- pnpm >= 8

## Install
```
pnpm install
```

## Run locally (two terminals)
- Terminal A (server):
```
pnpm dev:server
```
- Terminal B (client):
```
pnpm dev:client
```

Server runs on ws://localhost:2567
Client runs on http://localhost:5173

## Deploy
- Client: Vercel (apps/client)
- Server: Fly.io or Railway (apps/server)

### Railway (recommended free path) — Server
1. Push this repo to GitHub.
2. In Railway, create a new project and deploy from your GitHub repo.
3. Choose "Dockerfile" and set path to `apps/server/Dockerfile`.
4. Deploy. Railway will assign a public domain like `https://YOUR-APP.up.railway.app`.
5. Your WebSocket URL is `wss://YOUR-APP.up.railway.app`.

### Client configuration
Set the server URL for production builds:
- Create `apps/client/.env.production`:
```
VITE_SERVER_URL=wss://YOUR-APP.up.railway.app
```

### Vercel — Client
1. New Project → Import your GitHub repo
2. Root directory: `apps/client`
3. Build command: `vite build`
4. Output directory: `dist`
5. Environment Variables: `VITE_SERVER_URL = wss://YOUR-APP.up.railway.app`
6. Deploy
