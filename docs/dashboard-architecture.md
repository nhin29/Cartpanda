# Dashboard architecture (Part 2 written deliverable)

This document outlines how we would structure and operate a **dashboard** front-end (analytics, funnel list, settings, etc.) that would sit alongside the Cartpanda funnel builder. Choices are concrete and aimed at clarity, scalability, and pragmatic tradeoffs.

---

## 1. Architecture

**Routes/pages:** Single SPA with a small route set: `/` (funnel list or redirect), `/funnels` (list), `/funnels/:id` (builder), `/funnels/:id/analytics` (placeholder or embed), `/settings` (optional). Use **React Router** (or TanStack Router if we standardise on TanStack). Layout component wraps all routes: persistent header/sidebar + outlet for page content. No route-level code-splitting in v1; add when we have heavy analytics or reporting pages.

**Shared UI:** A `src/components/ui/` (or `design-system/`) folder for buttons, inputs, cards, modals, and data-table primitives. These are used by both the funnel builder and dashboard pages. Shared layout (header, nav, user menu) lives in `src/layout/` or inside a `Shell` component. Avoid page-specific components in the shared folder; if a component is only used on one page, it stays in that page’s feature folder.

**Feature modules:** Group by product area: `src/features/funnels/` (list, create, open builder), `src/features/analytics/` (charts, metrics), `src/features/settings/` (profile, team, API keys). Each feature owns: its route(s), page components, feature-specific hooks and API calls, and types. Shared hooks (e.g. auth, feature flags) live in `src/hooks/`. This keeps “where does X live?” obvious and avoids a single `components/` dump.

**Patterns to avoid spaghetti:** (1) No API calls or router logic inside presentational components—use hooks or small “container” components. (2) One place that knows “what is the current funnel id” (route params + optional context if needed). (3) Keep funnel builder state (nodes/edges) local to the builder route; dashboard does not hold builder state. (4) Typed API layer: e.g. `src/api/` or `src/features/*/api.ts` with functions that return typed promises; no raw `fetch` scattered in components.

---

## 2. Design system

**Build vs buy:** Start with **Tailwind** + a small set of our own components (buttons, inputs, cards, modals) and **CSS theme tokens** (as in the current app: `--color-*`, `--spacing-*`). We do not adopt a full component library (e.g. MUI, Chakra) initially so we keep bundle size down and avoid fighting overrides. If the team grows and we need complex tables, date pickers, and rich forms, we’d evaluate **Radix UI** (headless, a11y) or **shadcn/ui** (copy-paste components on top of Tailwind) and still enforce our tokens.

**Enforcing consistency:** (1) **Tokens only** for color, spacing, typography, and radius in `index.css` / Tailwind theme; components reference tokens, not raw hex or px. (2) **Component guidelines doc**: when to use primary vs secondary button, when to use a card vs a bare list. (3) **Lint rule** (e.g. stylelint or custom) to flag hardcoded colours outside theme. (4) **Accessibility:** All interactive components keyboard-focusable, focus ring from tokens; form inputs labelled; contrast checked against WCAG AA. One person (or rotation) owns “design system” reviews in PRs.

---

## 3. Data fetching + state

**Server vs client state:** **Server state** = data from the backend (funnel list, analytics, user settings). **Client state** = UI only (sidebar open/closed, selected tab, builder nodes/edges when in builder). We do not put server data in Redux/Zustand for caching; we use a **server-state library** for that.

**Concrete choice:** **TanStack Query (React Query)** for all server data. Fetchers live in `src/api/` or per-feature `api.ts`; components use `useQuery` / `useMutation` with stable keys (e.g. `['funnels']`, `['funnel', id]`). Benefits: caching, deduplication, loading/error/empty states, refetch on focus or interval where needed. Auth token (or cookie) is attached in a single place (e.g. axios/fetch interceptor or Query client default headers).

**Loading/error/empty:** Every list or detail view has: loading skeleton or spinner, error state with retry, empty state (e.g. “No funnels yet — create one”). Handled in the same component or a small wrapper; we avoid “data or null” with no UI.

**Filters/sorts/pagination:** For funnel list (and any table): filters and sort are **query params** (e.g. `?status=active&sort=updated`). API accepts these; TanStack Query key includes them so cache is per view. Pagination: cursor- or offset-based in API; `useInfiniteQuery` if we want “load more” or infinite scroll. Table component receives `data`, `isLoading`, `error`, and callbacks for sort/filter changes that update the URL.

---

## 4. Performance

**Bundle splitting:** Entry point stays one app. Use **React.lazy** for route-level chunks: e.g. `const FunnelBuilder = lazy(() => import('@/features/funnels/FunnelBuilder'))`. Analytics and heavy reporting pages are the first candidates. Keep the funnel builder in its own chunk so the default “list” experience stays small.

**Virtualization:** Any list that can grow large (funnel list, big tables, long dropdowns) uses **virtualization** (e.g. TanStack Virtual or react-window). We do not render hundreds of rows in the DOM.

**Memoization / rerenders:** Avoid unnecessary rerenders: (1) Keep server state in TanStack Query (components that don’t use a query don’t rerender when that query updates). (2) Callbacks passed to children are wrapped in `useCallback` when they’re in a dependency array or passed to memo’d components. (3) Expensive derivations (e.g. filtered list) use `useMemo`. We do not memo everything by default; we add memo/useMemo/useCallback when profiling or UX shows a need.

**Instrumentation:** (1) **Web Vitals** (LCP, FID, CLS) via `web-vitals` and send to our analytics or error tool. (2) **Custom marks:** e.g. “builder-open” to “first-render” so we can measure “time to interactive” for the builder. (3) Optional: **React Profiler** or a small wrapper to log slow commits in dev. “Dashboard feels slow” is answered by: Core Web Vitals + “time to first table row” (or “time to builder ready”) and fixing the biggest bottlenecks first.

---

## 5. DX & scaling to a team

**Onboarding:** README with: clone, install, env vars (e.g. `VITE_API_URL`), `npm run dev`. One-page “Architecture” doc (this file plus a short “where things live” diagram). New engineers run the app and open one feature folder (e.g. `features/funnels`) and follow data flow from route → component → API.

**Conventions:** (1) **ESLint + Prettier** checked in CI; same config for everyone. (2) **PR template:** checklist (test added/updated if needed, a11y considered, no hardcoded secrets). (3) **Component guidelines:** functional components only; props typed with TypeScript; no prop drilling beyond 2 levels—use composition or a small context. (4) **Naming:** `features/<name>/`, components PascalCase, hooks `use*`, API functions `get*` / `create*` / `update*`.

**Preventing one-off UI:** (1) New UI that looks like a button, input, or card must use (or extend) the shared component set. (2) Design review or “design system” label on PRs when new patterns appear. (3) If we add Storybook, shared components have stories so we can spot drift and reuse.

---

## 6. Testing strategy

**Unit:** Pure logic (serialization, validation, formatters, API response transformers) and small hooks (e.g. “given list of funnels, return next default name”) with **Vitest**. No need to render React for these. Target: high coverage on `utils/` and `api/` layers.

**Integration:** Key user flows in the dashboard: “load funnel list,” “open funnel builder,” “add node and connect,” “export JSON.” Use **React Testing Library** + Vitest; mock API with MSW (Mock Service Worker). One or two tests per major route or flow. These catch “did we break the wiring?” more than implementation details.

**E2E:** Critical path only: e.g. “log in (or use public demo) → open builder → add Sales Page and Order Page → export.” **Playwright** (or Cypress) against a staging or local backend. Run in CI on main before deploy. We do not E2E every button; we protect the “money path.”

**Minimum before moving fast:** Unit tests for any new serialization/validation and API helpers; one integration test touching the new feature (e.g. new page or new mutation). E2E runs on every release. This keeps confidence without blocking every PR on a full E2E suite.

---

## 7. Release & quality

**Feature flags:** Use a simple flags service (e.g. env-based or a small API `GET /flags`) and a `useFeatureFlag(name)` hook. New features (e.g. “new analytics view”) are hidden behind a flag and turned on per environment or percentage. Allows merging behind flag and enabling after validation.

**Staged rollouts:** Prefer **gradual rollout** by environment: deploy to staging first, then production. If we have backend versioning, we can ship dashboard that works with both old and new API during transition. No “big bang” release of dashboard + API in one step.

**Error monitoring:** Front-end errors (unhandled rejections, React error boundary) sent to **Sentry** (or similar). Include release version and user context (no PII). Alerts on error rate spike. This answers “did the last deploy break something?” quickly.

**Ship fast but safe:** (1) All PRs pass lint and tests. (2) Main is always deployable (no “WIP” commits that break build). (3) Deploy is automated (e.g. Vercel/Netlify on push to main). (4) Feature flags and staged rollouts let us merge often but expose changes gradually. We prioritise “small, reviewable PRs” and “revert if needed” over holding big releases.
