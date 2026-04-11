# Kinom Backend

Single backend API for web and mobile using one Express server, one MongoDB database, and Socket.IO realtime updates.

## Quick Start (Local)

1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install`
3. Run: `npm run dev`

Server:

- API base: `http://localhost:5000/api`
- Socket.IO: `http://localhost:5000`

Core routes:

- `POST /api/posts`
- `GET /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

Realtime:

- On post creation, the backend emits `new_post` to all connected clients.

CORS:

- Website: `http://localhost:5173`
- Expo Web: `http://localhost:19006`
- Expo / app dev support: `http://localhost:8081`, `http://localhost:19000`, `http://localhost:19001`, `http://localhost:19002`
- Mobile clients without a browser origin header are allowed by default.

## Docker

1. `docker compose up -d --build`
2. API: `http://localhost:5000/api/health`
3. MongoDB inside Docker network: `mongodb://kinom:27017/kinom`
4. MongoDB is not published to `localhost:27017`, which avoids host port conflicts.

