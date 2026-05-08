# Jukebot

Jukebot is a Discord bot with a web dashboard for managing an audio jukebox per Discord server.

A server dashboard is directly accessible with its guild ID:

```text
http://localhost:3000/<guild_id>
```

The legacy dashboard URL is still available:

```text
http://localhost:3000/dashboard/<guild_id>
```

## Requirements

- Docker + Docker Compose for the recommended installation.
- A Discord bot created from the Discord Developer Portal.
- The bot must be invited to the target Discord server.
- The Discord server ID (`guild_id`). Enable Discord developer mode, right-click the server, then copy its ID.

To run without Docker, you also need:

- Node.js 22 or newer.
- npm.
- ffmpeg installed on the host machine.

## Discord Setup

In the Discord Developer Portal:

1. Create an application.
2. Add a bot to that application.
3. Copy the bot token.
4. Copy the application ID.
5. Invite the bot to your server with the permissions required to view and join voice channels.

Example invite URL:

```text
https://discord.com/oauth2/authorize?client_id=<DISCORD_APP_ID>&scope=bot&permissions=3147776
```

## Environment Variables

Create a `.env` file at the project root:

```bash
cp .env.example .env
```

Then set at least:

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_APP_ID=your_discord_application_id
```

Default local configuration:

```env
PORT=3001
DATA_PATH=./data
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/api/v1/ws
```

## Run With Docker

From the project root:

```bash
docker compose up --build
```

If your machine uses the legacy Compose command:

```bash
docker-compose up --build
```

Exposed services:

- Frontend : `http://localhost:3000`
- Backend API : `http://localhost:3001/api/v1`
- WebSocket : `ws://localhost:3001/api/v1/ws`

Audio files and metadata are stored in `./data` on the host, mounted into the backend container.

Open the dashboard at:

```text
http://localhost:3000/<guild_id>
```

## Run Without Docker

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start --workspace backend
```

In another terminal, start the frontend:

```bash
npm run dev --workspace frontend
```

The dashboard is then available at:

```text
http://localhost:3000/<guild_id>
```

## Production Build

```bash
npm run build
```

You can also build each workspace separately:

```bash
npm run build --workspace backend
npm run build --workspace frontend
```

## Self-Hosting Notes

- `FRONTEND_URL` must match the public frontend origin, otherwise the backend CORS policy will reject requests.
- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are used by the browser. For remote hosting, they must point to URLs reachable from the user's browser.
- If you change `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_WS_URL` with Docker, rebuild the frontend image.
- The backend uses ffmpeg to convert uploaded files to opus. The Docker image installs it automatically.
- The backend container uses host networking because Discord Voice relies on outbound UDP and can be unreliable behind Docker bridge networking on some hosts.
- Never commit your Discord token.
