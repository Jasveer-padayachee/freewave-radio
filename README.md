# FreeWave Radio 📻

A real, working Progressive Web App for streaming **free internet radio stations**
from anywhere in the world — no fake data, no mock UI. Station data and stream
URLs come live from the [Radio Browser API](https://www.radio-browser.info/),
a free, open, community-maintained directory of tens of thousands of real
internet radio stations.

## Features

- 🔎 Search stations by **name**, **country**, or **genre**
- ▶️ Tap a station to stream it instantly (HTML5 `<audio>`)
- ⏸️ Pause / resume, 🔊 volume control with mute
- ❤️ Add / remove favourites — saved in `localStorage`, persists after closing the app
- 🖼️ Station logos where available, with a graceful letter-avatar fallback
- ⏮️ Remembers the last-played station between sessions
- 🚨 Auto-detects broken/dead streams and automatically skips to the next station in the list, with a visible error state
- 📱 Fully responsive, installable PWA (works offline for the app shell; streams obviously need a live connection)
- 🎧 Playback continues while you keep browsing/searching for other stations

## Tech stack

- React 18 + Vite 5
- Plain CSS (no framework) — dark, Spotify-style layout
- `vite-plugin-pwa` for the installable app shell / manifest / service worker
- Radio Browser API for real station search + metadata
- `localStorage` for favourites, volume, and last-played station

## Project structure

```
freewave-radio/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/
    │   └── radioBrowser.js      # Radio Browser API client
    ├── components/
    │   ├── SearchBar.jsx
    │   ├── Filters.jsx
    │   ├── StationCard.jsx
    │   ├── StationList.jsx
    │   ├── PlayerBar.jsx
    │   ├── NavTabs.jsx
    │   └── Loader.jsx
    ├── hooks/
    │   ├── usePlayer.js         # audio playback + error/auto-skip logic
    │   └── useFavorites.js      # favourites state + persistence
    └── utils/
        └── storage.js           # localStorage helpers
```

---

## 1. Install

You need [Node.js](https://nodejs.org) 18+ installed on your laptop.

```bash
cd freewave-radio
npm install
```

## 2. Run it locally

```bash
npm run dev
```

Vite will print two URLs, e.g.:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.23:5173/
```

Open the **Local** URL on your laptop — the app is live. Search "jazz", click a
station, and audio should start streaming within a couple of seconds.

## 3. Test it on your phone

Your phone and laptop just need to be on the **same Wi‑Fi network**:

1. Run `npm run dev` (as above) — note the **Network** URL it prints (something
   like `http://192.168.1.23:5173/`).
2. On your phone's browser, type that exact address in.
3. The app loads and works exactly like on the laptop.
4. Optional: on Android Chrome or iOS Safari, use **"Add to Home Screen"** (Safari
   share menu → Add to Home Screen, or Chrome menu → Install app) to install
   FreeWave Radio as a standalone app icon.

If your phone can't reach that address, check that:
- Your laptop's firewall allows inbound connections on port 5173.
- Both devices are truly on the same network (not a "guest" Wi-Fi that isolates devices).

Alternatively, use a tunnel like [ngrok](https://ngrok.com) (`ngrok http 5173`)
to test over the open internet, including on mobile data.

## 4. Build for production

```bash
npm run build
npm run preview
```

`npm run build` outputs a static `dist/` folder — that's the entire app,
ready to be hosted anywhere that serves static files.

## 5. Publish it online for free

Any static host works since this is a 100% client-side app. Easiest options:

### Netlify (drag-and-drop, no CLI needed)
1. Run `npm run build`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist/` folder in.
3. You get a live HTTPS URL instantly, shareable and installable as a PWA on phones.

### Vercel
```bash
npm i -g vercel
vercel --prod
```
Vercel auto-detects Vite and builds it for you.

### GitHub Pages
1. Push this project to a GitHub repo.
2. In `vite.config.js`, add `base: '/your-repo-name/'` inside `defineConfig`.
3. `npm run build`, then deploy the `dist/` folder via the `gh-pages` package or GitHub Actions.

### Cloudflare Pages
Connect your GitHub repo in the Cloudflare dashboard, set build command
`npm run build` and output directory `dist` — done.

HTTPS is required for microphone/etc. APIs but **not** strictly for audio
playback; however all the hosts above give you HTTPS by default anyway, which
also makes PWA install ("Add to Home Screen") work correctly on iOS.

---

## How the radio data works (no fake stations)

`src/api/radioBrowser.js` talks directly to the [Radio Browser API](https://www.radio-browser.info/),
a free, open, community-run API — no API key required. Because it's served
from multiple independent community mirrors, the app:

1. Asks `all.api.radio-browser.info` for the current list of live mirrors and
   picks one at random (this is Radio Browser's own recommended pattern).
2. Falls back to a small hardcoded list of known mirrors if that lookup fails.
3. If a request to the chosen mirror fails outright, it automatically retries
   once against a different mirror.

All station results — name, country, genre tags, logo, bitrate, and the
actual stream URL — come straight from that live API. Nothing is hardcoded.

## How broken streams are handled

Many public radio streams occasionally go offline. `usePlayer.js`:

- Shows a loading spinner while a stream connects.
- Uses a 12-second connect timeout — if a stream never starts, it's treated as dead.
- Listens for the browser's native `error`/`stalled` audio events.
- On failure, shows a clear error message in the bottom player bar **and**
  automatically advances to the next station in whatever list you were
  browsing, so a single dead stream doesn't stop your session.

## Notes & known limitations

- This was built and tested in a sandboxed dev container whose outbound
  network is locked to a small allow-list, so live calls to
  `api.radio-browser.info` couldn't be executed *from that container*. The
  build was verified to compile and run cleanly (`npm run build` /
  `npm run preview` both succeed with no errors) — the API itself is a public,
  browser-CORS-friendly service, and will work normally the moment you run
  the app on your own laptop or phone with normal internet access.
- iOS Safari requires a user gesture (tap) before audio can start — this is a
  platform restriction, not a bug. The first tap on a station always works;
  autoplay of the "last played" station on page load is intentionally *not*
  attempted, since browsers block it anyway.
- Some stations in the directory are genuinely offline at any given moment
  (it's a global crowd-sourced list) — the auto-skip behavior exists
  specifically to smooth over this.
