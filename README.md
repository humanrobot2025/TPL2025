<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mDLaK04VTCLkAS9Cp0rfn73EihmMhNYq

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   ## Deploy

   This project is configured to publish the production build to GitHub Pages.

   - The Vite `base` is set to `/TPL2025/` in `vite.config.ts`.
   - A GitHub Actions workflow (/.github/workflows/gh-pages.yml) builds and deploys `dist` on push to `main`.
   - The `homepage` in `package.json` points to: https://humanrobot2025.github.io/TPL2025

   To deploy manually:

   ```bash
   npm install
   npm run build
   npx gh-pages -d dist
   ```
---

## Admin & Live Pages 🔧📡

This app now includes two special routes accessible via the URL hash:

- `/#/admin` — **Admin** page for editing or deleting saved match results (requires no auth when running locally).
- `/#/live` — **Live** view (read-only) suitable for embedding as a public scoreboard.

Open these routes in your browser after running `npm run dev` or when the app is deployed.

Note: the Live view updates in real-time across tabs using BroadcastChannel (and falls back to the `storage` event), so viewers do not need to refresh the page to see score updates.

### Cross-device Live View (SSE server)

To enable live updates across devices (admin on one device, multiple viewers on other devices), a small Server-Sent Events (SSE) server is included in `/server`.

- Start the SSE server:

  `npm run dev:server`

  (server listens on port 4000 by default)

- Configure the app to use the SSE server by setting `VITE_SSE_URL` when running the dev server, for example:

  `VITE_SSE_URL="http://localhost:4000" npm run dev`

- How it works:
  - Admin (scorer) sends active match updates to the SSE server (POST /active) and clears it with DELETE /active.
  - Viewer clients connect to `/events` with EventSource and receive `active` and `clear` events in real time.

Note: The SSE server stores the latest active match in-memory; restart will clear it. This keeps the implementation intentionally minimal for local testing or small deployments.

### Firebase (Firestore) realtime option

If you prefer a managed realtime backend (so you don't need to run your own SSE server), you can use Firebase Firestore. The app will listen to a document in Firestore and receive updates in near real-time.

Setup steps:
1. Create a Firebase project at https://console.firebase.google.com/ and enable Firestore (Native mode).
2. Add a Web app to your project (Register app) and copy the config values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
3. Set these as environment variables when running the dev server (or build):

   ```bash
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   npm run dev -- --host
   ```

4. Once configured, the admin scorer will write the active match to Firestore at `live/active` and all connected clients will automatically receive updates.

Notes:
- Firestore requires a secure write path for production — for testing you can allow open writes or add a simple admin server to sign requests.
- The Firestore approach avoids running an SSE server and works across devices and networks (recommended for small teams).


---

## Admin token (optional)

You can protect the Admin page with a simple URL token. This is a client-side-only gate (not cryptographically secure) and should be used as an obscurity measure only.

1. Generate a token (example):

```bash
# example using openssl
openssl rand -hex 12
```

2. Add the token to an environment file at the project root:

```
VITE_ADMIN_TOKEN=humanrobot

```

3. Rebuild and deploy (or run locally with):

```bash
npm run build
npm run preview
```

4. Share the admin link with your token in the URL:

```
https://humanrobot2025.github.io/TPL2025/#/admin?key=humanrobot

```

Notes:
- This token is embedded into the client bundle at build time and therefore is visible to anyone who inspects the published JavaScript bundle — for real security use a server-side authentication flow.
- If `VITE_ADMIN_TOKEN` is not set the Admin page remains open (no token required) to preserve the existing local development experience.