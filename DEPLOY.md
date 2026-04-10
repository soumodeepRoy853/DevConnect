Deployment notes
================

Overview
--------
This repo contains two separate apps:

- `client/` — Next.js front-end (deploy to Vercel)
- `server/` — Express API (deploy to a traditional Node host: Render, Heroku, Railway, etc.)

Client (Vercel)
----------------
1. In Vercel, create a new project from this repository.
2. Vercel will use `vercel.json` to build the Next app from `client/`.
3. Set required environment variables in Vercel (Project Settings):
   - `NEXT_PUBLIC_API_URL` = `https://<your-server-domain>/api` (eg. `https://api.example.com/api`)
4. Deploy. The `client` app will be served from Vercel.

Server (Render / Heroku / Railway)
----------------------------------
This Express server runs as a long-lived process and is not suitable to run as a single monolithic process on Vercel.

Recommended quick deploy (Render):
1. Create a new Web Service on Render and point it to this repository.
2. Set the Root Directory to `server/`.
3. Build Command: `npm install`
4. Start Command: `node server.js` (or leave default — Procfile is present)
5. Configure environment variables on the host for production (at minimum):
   - `MONGO_URI` or `DATABASE_URL` — your MongoDB connection string
   - `JWT_SECRET` — JSON Web Token secret
   - `CLIENT_URL` — URL of the frontend (Vercel app)
   - Any other env vars you use in `.env`

Notes
-----
- The `server/package.json` `start` script uses `node server.js` for production; `dev` uses `nodemon`.
- The `client/next.config.mjs` sets `outputFileTracingRoot` so Vercel builds the Next app reliably when multiple lockfiles exist.
- If you prefer to host both on Vercel under the same domain, consider migrating API endpoints into Next.js Serverless Functions under `client/app/api` or `client/pages/api` (refactor required).

Environment files
-----------------
I added example env files to the repository to make onboarding and host configuration easier:

- `client/.env.example` — includes `NEXT_PUBLIC_API_URL` (public API base URL).
- `server/.env.example` — includes `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `PORT`.

Copy the examples to `.env.local` for local development or configure the values in your host's dashboard. Never commit real secrets to the repository.
