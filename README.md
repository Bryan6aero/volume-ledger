# Weekly Volume Ledger

A phone web app that counts reps with the camera and tracks weekly hard sets per body part against hypertrophy goals.

- `index.html` — the app
- `core.js` — rep counter, effort estimate, exercise and muscle tables
- `lib/` — MediaPipe pose tracking library (the pose model itself downloads from Google on first use)
- `test.mjs` — run `node test.mjs` to test the rep counter on simulated movement

All workout data stays in the browser on the phone. Nothing is uploaded.

To host: GitHub repo Settings → Pages → Deploy from a branch → `main` / root.
