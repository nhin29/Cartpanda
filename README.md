# Cartpanda — Upsell Funnel Builder

Drag-and-drop funnel builder for designing sales → order → upsell/downsell → thank-you flows. Built with React, TypeScript, React Flow, and Tailwind CSS.

## How to run locally

**Prerequisites:** Node.js 18+ and npm.

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Main architecture decisions

- **React Flow as the canvas** — Nodes, edges, pan/zoom, minimap, and connection handles are handled by React Flow. We define five custom node types (Sales Page, Order Page, Upsell, Downsell, Thank You) and plug in validation and persistence.
- **Single source of truth** — Funnel state lives in React state (`nodes` and `edges`) in `App.tsx`. React Flow is controlled via `nodes`/`edges` and `onNodesChange`/`onEdgesChange`; we never rely on React Flow’s internal state for persistence or export.
- **Serialization boundary** — Types in `src/types/funnel.ts` define `SerializedFunnel` (nodes + edges as plain JSON). `src/utils/serialization.ts` converts to/from React Flow’s shape with validation; localStorage and Export/Import use this format only.
- **No global store** — No Redux/Zustand/Context for funnel data. State is lifted to `App` and passed down; hooks (`useFunnelPersistence`, `useInitialFunnel`) handle side effects. Keeps the app simple and easy to follow.
- **Design tokens in CSS** — `src/index.css` uses Tailwind’s `@theme` with semantic tokens (`--color-canvas`, `--color-surface`, `--color-accent`, etc.) so theming and consistency can evolve in one place.
- **Feature-oriented folders** — `components/canvas`, `components/nodes`, `components/palette`, `components/ui`; `hooks`, `utils`, `types`, `constants` keep responsibilities clear and make it straightforward to add new node types or validation rules.

## Accessibility notes

- **Keyboard:** Focus order follows header (palette toggle, Undo, Redo, Export/Import) then sidebar (palette items) then main canvas. Buttons use visible focus rings (`focus:ring-2 focus:ring-[var(--color-accent)]`). Node/edge deletion: Backspace or Delete when element is selected.
- **Screen readers:** Header and action buttons have `aria-label` where needed. Palette toggle has `aria-expanded`. Canvas has `role="main"` and `aria-label="Funnel editor"`. Validation panel uses a live region so messages are announced. Custom nodes expose structure (title, button label) and invalid state is communicated with text (e.g. “Should have exactly one outgoing connection”) in addition to color/border.
- **Visual:** Invalid states (e.g. Sales Page with 0 or >1 outgoing edge) use border color plus an explicit message so they are not indicated by color alone. Contrast uses dark text on light backgrounds and the accent color for focus and interactive states.
- **React Flow:** Minimap has `ariaLabel`. Custom nodes use semantic markup. We did not alter React Flow’s default keyboard behavior for the canvas; any limitations (e.g. complex keyboard-driven node creation) are documented here as a known tradeoff.

## Tradeoffs / what we’d improve next

- **No in-app editing of funnel page content** — Nodes show a static title and button label per type. Real “page editing” (copy, media, etc.) is out of scope; a next step would be a node detail panel or modal bound to the same serialization format.
- **Undo/redo in memory only** — History is kept in component state and capped at 50 steps. It is not persisted across reloads; extending the serialization format to support optional history would allow “restore previous session.”
- **Validation is advisory** — Orphan nodes and invalid Sales Page connections are highlighted and listed in the validation panel but not blocked. Blocking would require intercepting connection and delete actions and could be added without large refactors.
- **Limited keyboard flow for adding nodes** — Users can tab to palette items and drag; we do not have “select type then press Enter to add at focus/cursor.” Adding an “Add to canvas” action (e.g. from palette with a default or last-used position) would improve keyboard-only UX.
- **Single funnel per origin** — One localStorage key (`cartpanda-funnel`) per origin. Supporting multiple named funnels would mean a small list/detail state and keyed storage.
- **No automated tests in repo** — Unit tests for `serialization` and `validation`, plus a few integration tests for the canvas and palette, would reduce regressions and are the first thing we’d add for ongoing maintenance.

Dashboard architecture (routes, design system, data fetching, performance, DX, testing, release) is described in **`/docs/dashboard-architecture.md`** for the written Part 2 deliverable.
