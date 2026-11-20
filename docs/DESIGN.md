# Design

The thinking behind how Bokedex looks, moves, reads in two languages, and flows.

## Concept

**A holo-card binder that grew into an encyclopedia.** Every Pokémon is a collectible card that tilts under the pointer and carries its own type colors. The card is also the navigation: click it and its artwork morphs into the hero of the detail page. That one moment is where the design spends its boldness. Everything around it (moves, items, places, tables) stays calm, dense and readable, so the Pokémon remain the loudest thing on screen.

Audience: Pokémon fans and players, in English or Japanese, who want to look something up quickly, plan a team, or check a matchup mid-game.

Primary job: get from "what was that?" to the answer in a click or two, from anywhere, and keep the next question (who learns it, where is it, what does it evolve into) one tap away.

## Principles

1. **Color comes from the subject.** The UI chrome is neutral; the accent on any card or detail page is the Pokémon's own type colors, so the interface feels different for Charizard and Blastoise without extra decoration.
2. **One memorable motion.** The tilt and the card-to-hero morph carry the personality. Other motion answers an action (bars filling, answers revealing) rather than decorating idle screens.
3. **Reference data stays scannable.** Numbers use tabular figures, tables align and sort, and risk uses red and green consistently (weakness, resistance).
4. **Everything links to everything.** A move links to its learners, a learner to its moves, an item to who holds it, a place to what lives there. The encyclopedia is the connections.
5. **Two languages, one layout.** The visitor's language is primary, the other is a quiet second line, and nothing shifts when the language changes (see "Reading in two languages").
6. **Plain words.** Sentence case, active verbs, no filler. Empty and error states say what happened and what to do.

## Design tokens

### Color

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#edeffb` | `#0b0e26` | Page background |
| `--surface` | `#ffffff` | `#151a40` | Cards and panels |
| `--surface-2` | `#f5f6fe` | `#1b2150` | Inset areas, tracks |
| `--ink` | `#12163a` | `#eef0ff` | Text and primary buttons |
| `--muted` | `#5b6190` | `#9aa1d6` | Secondary text |
| `--line` | `#d9ddf3` | `#262c5e` | Borders |
| `--brand` | `#f2384a` | same | Primary action, streaks |
| `--glow` | `#ffc93c` | same | Highlights, legendary badge |
| `--poke`, `--poke-2` | per Pokémon | per Pokémon | Primary and secondary type color, set on each card and detail page |

Type colors are defined in `app/utils/types.ts`. Text on a type color is chosen by WCAG luminance (`readableInk`) so a yellow Electric badge gets dark text and a purple Dragon badge gets white. Unknown future types get a color derived from their name.

### Typography

| Use | Face | Why |
| --- | --- | --- |
| Display and numerals | Bricolage Grotesque (500, 700, 800) | Characterful and compact; the dex numbers and names carry the personality |
| Body and UI | Instrument Sans (400 to 600) | Quiet and legible at small sizes |
| Japanese | Noto Sans JP (400, 500, 700) | The Latin faces have no Japanese glyphs; naming one avoids mismatched system fallbacks |

Headlines use tight tracking (`-0.02em`) and a line height of 1.1; body text stays under about 70 characters per line.

### Shape, depth and spacing

Large radii (20 to 36px) on panels and cards, pill shapes for chips and badges. One soft shadow token for all raised surfaces. A faint dot grid on the page background nods to a scanner screen without competing with content.

## Screens

| Screen | Purpose | English | Japanese or variant |
| --- | --- | --- | --- |
| Pokédex (`/`) | Find any Pokémon: search, filter, sort, favorite | ![Home](screenshots/home.webp) | ![Home in Japanese](screenshots/home-ja.webp) |
| Pokémon (`/pokemon/6`) | Everything about one Pokémon, form by form | ![Pokémon](screenshots/pokemon.webp) | ![Pokémon in Japanese](screenshots/pokemon-ja.webp) |
| A form (`/pokemon/6/mega-x`) | The form's own types, stats and abilities | ![Mega form](screenshots/pokemon-mega.webp) | ![Dark theme](screenshots/pokemon-dark.webp) |
| Search (`⌘K`) | One box across Pokémon, moves, abilities, items, places | ![Search](screenshots/search.webp) | |
| Moves (`/moves`) | Sort and filter every move | ![Moves](screenshots/moves.webp) | ![Move detail](screenshots/move-detail.webp) |
| Item (`/items/master-ball`) | Effect, price, TMs and holders | ![Item](screenshots/item.webp) | |
| Place (`/locations/kanto-route-1`) | Wild Pokémon per game | ![Place](screenshots/location.webp) | |
| Compare (`/compare`) | Stats side by side, best highlighted | ![Compare](screenshots/compare.webp) | ![Calculator](screenshots/calculator.webp) |
| Type chart (`/types`) | Look up and calculate matchups | ![Types](screenshots/types.webp) | |
| Team (`/team`) | Build six with Tera types and EVs, see real stats and the holes | ![Team](screenshots/team.webp) | ![Edit build](screenshots/team-build.webp) |
| Z-Moves and Max Moves (`/battle-moves`) | Each type's moves and the power conversion | ![Z-Moves and Max Moves](screenshots/battle-moves.webp) | ![On a move page](screenshots/move-battle.webp) |
| Play (`/play`) | Five quick quizzes | ![Who's that Pokémon](screenshots/game-silhouette-reveal.webp) | ![Type master](screenshots/game-type-master.webp) |
| More quizzes | Stat duel, and name match in Japanese | ![Stat duel](screenshots/game-stat-duel.webp) | ![Name match](screenshots/game-name-match-ja.webp) |

### Key components

| Card under the pointer | Evolution tree (Eevee) |
| --- | --- |
| ![Holo card](screenshots/card-hover.webp) | ![Evolution tree](screenshots/evolution.webp) |

## User flows

### Overall navigation

```mermaid
flowchart TD
  Start([Open Bokedex]) --> Home["Pokédex<br/>search · filter · sort"]
  Start --> Search["Global search (⌘K)"]
  Search --> Detail
  Search --> Entity
  Home -->|click a card| Detail["Pokémon page"]
  Detail -->|form pills| Form["A form's page"]
  Detail -->|move, ability, item, place links| Entity["Move · ability · item · place"]
  Entity -->|learners, holders, residents| Detail
  Detail -->|Add to team| Team["Team builder"]
  Detail -->|evolution link or arrow keys| Detail
  Home --> Tools["Advanced search · compare · calculator"]
  Tools --> Detail
  Nav([Header or bottom bar]) --> More["Reference: types, natures, games, Pokédexes, generations, regions, egg groups"]
  Nav --> Play["Quizzes"]
  Entity -->|Z-Move and Max Move| Battle["Z-Moves and Max Moves"]
```

### Find anything

```mermaid
flowchart LR
  A["Open search<br/>(⌘K or the search button)"] --> B["Type in English, kanji, kana or romaji"]
  B --> C["Results grouped by what they are,<br/>filterable by category"]
  C -->|arrow keys and Enter, or click| D["The page"]
```

### Explore one Pokémon

```mermaid
flowchart TD
  A["Hero: names in both languages, types, flavor text"] --> B["Forms: switch to Mega, Gigantamax, regional..."]
  B --> C["Stats, EV yield, matchups, abilities, profile"]
  C --> D["Evolution with its conditions"]
  D --> E["Moves: pick a game and a method"]
  E --> F["Where to find: pick a game"]
  F --> G["Held items, earlier generations, entries, gallery"]
```

The moves and the where-to-find sections load when they scroll into view, so the page opens immediately.

### Build and check a team

```mermaid
flowchart TD
  A["Add Pokémon<br/>(dialog, or Random team)"] --> B{Six slots full?}
  B -->|no| A
  B -->|yes or partial| E2["Edit a member: Tera type, nature,<br/>ability, level, IVs, EVs"]
  E2 --> C["Stats and analysis update live"]
  C --> D["Defensive holes<br/>types that hit more members than they resist"]
  C --> E["Offensive coverage"]
  C --> F["Weakness breakdown"]
  D --> G["Swap a member and re-check"]
```

### Play a quiz

Five games share one flow: silhouettes, the type chart, stat duels, name match (the name in the other language, pick the matching one) and ability check.

```mermaid
flowchart TD
  A["Choose a game tab"] --> B["Start"]
  B --> C["Round n of 10"]
  C --> D["Answer by click or keys 1 to 4"]
  D --> E["Reveal: right or wrong, with the answer"]
  E --> F{Last round?}
  F -->|no| G["Next (Enter)"] --> C
  F -->|yes| H["Result: score, best, longest streak"]
  H --> J["Play again"] --> B
```

Answers are shown in the visitor's language, so the Japanese quiz is a Japanese-name quiz; name match asks for the other language on purpose.

## Reading in two languages

- **Names appear as a pair.** The visitor's language is the large line; the other is a smaller line beneath ("ピカチュウ" over "Pikachu", and the reverse). Lists show the second name small beside the first.
- **Layout does not depend on language.** Labels are short in both, and lists and tables are built to take longer Japanese or English strings.
- **Honest fallback.** When only English exists (most effect text), it is shown in English with a small "EN" badge and a tooltip, never silently swapped or hidden.
- **Search ignores script.** Hiragana, katakana, romaji and English find the same thing.
- **Numbers read like the games.** Japanese names use ordinary digits and letters (`10まんボルト`).
- **Switching keeps your place.** The language switch links to the same page in the other language.

## Motion

| Motion | Trigger | Purpose |
| --- | --- | --- |
| Card tilt and holographic sheen | Pointer over a card | The signature interaction; the sheen follows the pointer |
| Card to hero morph | Click a card | Shows that the detail page is the same Pokémon, enlarged (View Transitions API) |
| Float on detail and daily pick | Idle | Gentle life on the one hero image per page |
| Stat bars fill | Page load | Makes relative strength readable at a glance |
| Silhouette reveal | Answering | Confirms the answer; the silhouette becomes full color |
| Shake on wrong answer | Wrong answer | Immediate, non-punishing feedback |
| List enter, leave, move | Filtering | Shows what changed when results update |

All motion respects `prefers-reduced-motion`: animations and transitions collapse to near-zero and the card tilt is disabled.

## Accessibility

- Visible focus ring on every interactive element (3px, with offset). Hover lift and focus rings were scanned across pages at desktop and mobile widths to confirm scroll containers never clip them.
- Buttons that toggle state use `aria-pressed`; sort headers expose `aria-sort`; meters and progress use `role="meter"` and `role="progressbar"`.
- Text on type colors is contrast-checked by luminance; type is never conveyed by color alone (every badge carries its name).
- The page language is set per route (`lang="ja-JP"`), and text that falls back to English is marked `lang="en"` so screen readers pronounce it correctly.
- Skip link to main content; `aria-live` regions announce result counts and quiz feedback.
- Keyboard: `⌘K` or `Ctrl+K` opens search (arrows and Enter pick a result), `/` focuses the Pokédex search, left and right arrows move between Pokémon, `1` to `4` answer quizzes, `Enter` continues, `Esc` closes dialogs.
- Native `<dialog>` for search and the Pokémon picker gives focus trapping and Escape handling for free.

## Responsive behavior

| Width | Behavior |
| --- | --- |
| Under 1024px | Bottom pill navigation (Pokédex, moves, items, team, search, more) instead of the header links; the "More" sheet holds every other section |
| 1024px and up | Header navigation with a "More" menu; the detail page lays stats, matchups, profile and abilities out in two columns |
| Card grid | 2 columns, 3 from 640px, 4 from 1024px, 5 from 1280px |
| Tables and the type matrix | Scroll inside their own panel instead of scrolling the page |

| Pokédex | Pokémon | Team (Japanese) |
| --- | --- | --- |
| ![Home on mobile](screenshots/mobile-home.webp) | ![Pokémon on mobile](screenshots/mobile-pokemon.webp) | ![Team on mobile](screenshots/mobile-team.webp) |

## Voice

Sentence case, plain verbs, and one name per action ("Add to team" becomes "On your team"). Errors say what failed and what to do next and never apologize. Empty screens invite the next step ("Add a Pokémon to see weaknesses and coverage"). Japanese copy uses the games' own terms (わざ, とくせい, どうぐ) rather than literal translations.
