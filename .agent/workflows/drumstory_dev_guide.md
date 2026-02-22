---
description: Developer guide and architectural overview for DrumStory
---

# DrumStory Developer Guide

DrumStory is a vanilla JavaScript, mobile-first PWA for drummers to track their learning progress on songs and technical skills.

## Core Tech Stack
- **Frontend:** Vanilla HTML, CSS (`style.css`), JavaScript (`main.js` as an ES Module).
- **Bundler:** Vite (`npm run dev`, `npm run build`).
- **Database:** Firebase Cloud Firestore (`store.js`).
- **Authentication:** Firebase Auth (Google Sign-In via `firebase.js`).
- **API:** iTunes Search API (for querying song metadata).
- **PWA:** Managed via `manifest.json` and `sw.js` (service worker caching).

## Architecture

**1. `index.html`**
Contains the core DOM structure, including the `[Songs | Skills]` tab navigation, the generic `#items-grid` container for cards, and the `#item-modal` overlay for adding/editing items.

**2. `main.js`**
Acts as the controller. It manages:
- **State:** Tracks `activeTab` ('songs' or 'skills') and `currentItems` array.
- **Rendering:** Dynamically generates HTML Strings for `createItemCard()` depending on the tab context.
- **Events:** Handles tab switching, iTunes autocomplete dropdown fetching, inline Checkbox/List updates for Notes and Struggles.

**3. `firebase.js` & `store.js`**
The database and authentication layer.
- **Auth:** Listens to Google sign-in states and controls access.
- **Firestore Schema:**
  - `users/{uid}/songs/{uuid}`: Documents for songs `{title, artist, difficulty, progress, notes, completedNotes, struggles, completedStruggles}`.
  - `users/{uid}/skills/{uuid}`: Parallel collection for skills `{title, difficulty, progress, notes, completedNotes, struggles, completedStruggles}`.

## Maintaining the App

### Running Locally
1. Ensure dependencies are installed: `npm install`
2. Start the local server: `npm run dev`
3. Vite will serve the site at `http://localhost:5173`.

### Deploying
The project is linked to GitHub and deploys automatically to Vercel upon push.
To push updates:
```bash
git add .
git commit -m "Update message"
git push
```

### PWA Updates
If you update CSS or JavaScript and mobile users aren't seeing the changes, you **must** increment the `CACHE_NAME` version in `public/sw.js` (e.g., `drumstory-cache-v3`). This forces the service worker to download the fresh files on the next app load.

### Handling New Tabs
If expanding beyond "Songs" and "Skills":
1. Add a new tab button in `index.html`.
2. Add a new parallel list getter/setter in `store.js`.
3. Update the `loadItemsFromStore()` logic in `main.js`.
4. Ensure `createItemCard()` hides/shows entity-specific fields appropriately.
