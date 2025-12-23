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
