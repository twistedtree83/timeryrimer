# TimeRhymer

TimeRhymer is an immersive productivity timer app built with React + TypeScript + Vite.

## Features

- Start, pause, and reset controls
- Quick presets (focus/short break/long break)
- Custom minute/second timer input
- Progress bar with completion percentage
- Session counter for completed rounds
- Rotating motivational rhyme while the timer runs
- Three animated visual scenes (Aurora Bloom, Ember Night, Moon Tide)
- Immersive mode + fullscreen toggle
- Completion chime and keyboard shortcuts

## Live URL

https://twistedtree83.github.io/timeryrimer/

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

This repo now includes `.github/workflows/deploy-pages.yml` to deploy the built Vite output (`dist`) to Pages.

Important: in GitHub repository settings, set:

- **Settings → Pages → Build and deployment → Source = GitHub Actions**

If Source stays on legacy branch mode, Pages serves the raw Vite `index.html` (which references `/src/main.tsx`) and the app appears blank.
