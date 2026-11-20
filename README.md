# Bokedex

A fast, animated Pokédex and game companion. Browse every Pokémon, check type matchups, build a team and play quizzes, all from live data.

**Live site: [bokedex.web.app](https://bokedex.web.app)**

Built with **Nuxt 4, Vue 3, Pinia, VueUse and Tailwind CSS 4**. Data comes from the free [PokeAPI](https://pokeapi.co).

![Bokedex home](docs/screenshots/home.webp)

| Detail | Team builder |
| --- | --- |
| ![Pokémon detail](docs/screenshots/detail.webp) | ![Team builder](docs/screenshots/team.webp) |

| Type chart | Quiz |
| --- | --- |
| ![Type chart](docs/screenshots/types.webp) | ![Who's that Pokémon quiz](docs/screenshots/game-silhouette-reveal.webp) |

## Features

| Page | What it does |
| --- | --- |
| **Pokédex** `/` | Every Pokémon, with search by name or `#number`, type and generation filters, sorting, favorites and infinite scroll. Filters live in the URL, so a search can be shared. |
| **Detail** `/pokemon/:id` | Animated base stats, type matchups, abilities, profile (catch rate, gender ratio, egg groups), evolution tree with requirements, level-up moves with power, accuracy and PP, shiny toggle and cry audio. |
| **Type chart** `/types` | The full effectiveness matrix plus a one or two type defensive calculator. |
| **Team** `/team` | Six slots with shared weaknesses and offensive coverage analysis. |
| **Play** `/play` | *Who's that Pokémon?* and *Type master*, ten rounds each, with streaks and saved high scores. |

Also: dark mode, a card-to-hero shared-element transition, keyboard shortcuts (`/` to search, arrow keys between Pokémon, `1` to `4` in quizzes), reduced-motion support, and a mobile layout with bottom navigation.

## Quick start

Requires **Node 22.19+ or 24.11+**. Nuxt is installed locally by `npm install`; nothing is installed globally.

```bash
git clone https://github.com/bachbnt/bokedex.git
cd bokedex
npm install
npm run dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run generate` | Build the static site into `.output/public` |
| `npm run preview` | Serve the built site at `http://localhost:5002` with the production rewrites (needs the Firebase CLI) |
| `npm run typecheck` | Type-check the app, server and shared code |

## Built to grow with PokeAPI

Nothing enumerates Pokémon, types or generations. The Pokédex index and type chart are baked into static JSON at build time from about 30 PokeAPI calls, and a weekly scheduled build refreshes them. When PokeAPI adds a Pokémon, a type or a generation, the next build picks it up, and it shows up in the filters, the type chart, team analysis and the quizzes. Details and moves for each Pokémon are fetched live from PokeAPI in the browser.

It is a static site, so it needs no server and hosts for free. See [Architecture](docs/ARCHITECTURE.md) for how it works and the trade-offs.

## Deploy to Firebase Hosting

The site is live at **[bokedex.web.app](https://bokedex.web.app)** (Firebase project `bokedex`, site `bokedex`). It deploys to Firebase Hosting on the **free Spark plan**; no Cloud Functions or billing needed.

Requirements: the Firebase CLI, signed in to the account that owns the project (`firebase login:use <email>`, or pass `--account <email>`).

```bash
npm run generate                                          # build the static site into .output/public
firebase deploy --only hosting \
  --project bokedex --account <your-account-email>        # deploy (or: npm run deploy:firebase)
```

To try the built site locally first, run `npm run preview`. It uses the Hosting emulator, so the rewrites in `firebase.json` apply exactly as they do in production.

### Automatic weekly refresh

`.github/workflows/deploy.yml` typechecks, builds and deploys on every push to `main` and every Monday, so new Pokémon appear without any manual step. Until you add a deploy key it still builds and typechecks, and skips only the deploy.

To enable the deploy step:

1. In the Firebase console open **Project settings, Service accounts**, and generate a new private key.
2. In GitHub open **Settings, Secrets and variables, Actions** and add a repository secret named `FIREBASE_SERVICE_ACCOUNT_BOKEDEX` containing the full JSON.

## Documentation

| Document | Contents |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System diagram, caching, API reference, data flow, state and persistence, conventions, limitations |
| [Design](docs/DESIGN.md) | Concept, tokens, screens, user flows, motion, accessibility, responsive behavior |

## Project structure

```text
shared/   PokeAPI client, snapshot builder, Pokémon service, shared types
app/      Vue app: pages, components, composables, stores, utils
server/   Build-time routes that produce dex.json and types.json
docs/     Architecture, design and screenshots
```

## Conventions

- **No relative `../` imports.** Use aliases: `~/` (app), `#shared/` (shared) and `#server/` (server).
- **No `any`.** PokeAPI payloads are typed in `shared/pokeapi/types.ts`.
- `npm run typecheck` must pass. The root `tsconfig.json` points at the types Nuxt generates, which is also what makes the IDE resolve auto-imports such as `defineEventHandler`. If your editor shows red squiggles after a fresh clone, run `npm install` (it runs `nuxt prepare`) and restart the TypeScript server.

## Add a mini-game

1. Create a component in `app/components/game/`.
2. Call `useQuiz({ game, createQuestion })` for rounds, score and streak handling.
3. Add the key to `GameKey` in `app/stores/scores.ts`.
4. Register the game in `app/pages/play.vue`.

## Configuration

Override with environment variables at build time (see [Architecture](docs/ARCHITECTURE.md#configuration)):

| Variable | Default |
| --- | --- |
| `NUXT_PUBLIC_POKE_API_BASE` | `https://pokeapi.co/api/v2` |
| `NUXT_PUBLIC_SPRITE_BASE` | jsDelivr mirror of the PokeAPI sprites |
| `NUXT_PUBLIC_CRY_BASE` | jsDelivr mirror of the PokeAPI cries |

## Notes

- New Pokémon appear after the next build (weekly by default), not instantly.
- `/pokemon/:id` pages render in the browser, so there is no per-Pokémon HTML for search engines or link previews.
- Moves show the newest game that has level-up data for that Pokémon, which can be a game with a shorter move list.

## Credits

Bokedex is an unofficial fan project. Data and sprites come from [PokeAPI](https://pokeapi.co). Pokémon and all related names belong to Nintendo, Game Freak and The Pokémon Company.
