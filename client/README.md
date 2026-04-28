# McBook Client

Frontend for the McBook COMP 307 booking platform, built with React + Vite.

## Tech Stack

- React 19
- Vite
- React Router DOM

## Prerequisites

- Node.js 18+ (or current LTS)
- npm

## Current Structure

```text
client/
├── dist/
├── src/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Environment Variables

Optional `.env` values for the Vite app:

```bash
# By default the app calls /api on the same origin.
# Set this only if your API is hosted on a different origin.
VITE_API_URL=https://your-api-host/api
```

If `VITE_API_URL` is not set, the client uses `/api`.

## Run Locally

From `client/`:

```bash
npm install
npm run dev
```

- Vite app: `http://localhost:5173`
- API calls are proxied to `http://localhost:3000` through `vite.config.js`.

## Build for Production

From `client/`:

```bash
npm run build
npm run preview
```

Build output is generated in `client/dist`.

## Deploy on Mimi Server

This project is configured to run under:

- [https://winter2026-comp307-group03.cs.mcgill.ca/](https://winter2026-comp307-group03.cs.mcgill.ca/)

You can clone it on the server under `/home/cs307-user/app/`.

Then, build the frontend:
   ```bash
   cd client
   npm install
   npm run build
   ```
6. Start the Node server from `server/` (it listens on port `3000`).

Because the client uses relative `/api` calls by default, it works for both local dev (with Vite proxy) and server deployment (same origin).

## Key Routes

- `/` landing page
- `/login` login page
- `/dashboard` student dashboard
- `/owner/dashboard` owner dashboard
- `/slots` browse and book slots
- `/vote/:token` group poll voting page
