# Pokédex Tracker

A modern, single-page **Pokémon collection tracker** built with Angular 19.
Browse the full Pokédex, mark the Pokémon you have caught, and watch your
completion progress grow. Your progress is saved locally in the browser.

🔴 **Live:** https://gencomattia.github.io/pokemon-tracker/

## Features

- **Full Pokédex** loaded from the [PokeAPI](https://pokeapi.co) in a single
  request (no per-Pokémon calls).
- **Official artwork** for every Pokémon, served from the PokeAPI sprites CDN
  with an automatic pixel-sprite fallback.
- **Caught tracking** with a live progress bar, persisted in `localStorage`
  independently of the Pokédex data.
- **Instant search** by name or number and quick filters (all / caught /
  missing).
- **Infinite scroll** with lazy-loaded images for smooth performance across
  1000+ Pokémon.
- Responsive, dark-themed UI with no CSS framework dependency.

## Tech stack

- Angular 19 (standalone components + signals)
- RxJS
- Native SASS (no Bootstrap / Font Awesome)

## Development

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Build

```bash
npm run build
```

The production bundle is written to `docs/browser/`.

## Tests

```bash
npm test
```

## Deployment

Deployment is fully automated with **GitHub Actions**
(`.github/workflows/deploy.yml`). On every push to `master` (or a manual
run from the Actions tab), the app is built and published to GitHub Pages.

> The workflow self-configures Pages to use the "GitHub Actions" source, so no
> manual repository setting is required beyond enabling Pages.
