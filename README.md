# 花磚排列計算器 · Azulejo

A tile-layout calculator that arranges patterned (azulejo) tiles so that every
3×3 window is distinct (Sudoku-like), with controls for area/tile sizing, edge
slicing, adjacency restrictions, 2×2 rotation medallions, framing, and
simulated-annealing dispersion.

Ported from a Claude Design prototype (`花磚排列計算器.dc.html`) to a standalone
React + TypeScript + Vite app — no proprietary runtime.

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
npm run typecheck  # type-check only (tsc --noEmit)
npm test           # run the solver unit tests (Vitest)
```

## Tests

`src/solver.test.ts` (Vitest) covers the pure algorithm in `src/solver.ts`: the
PRNG, `textColor`, grid sizing/slicing/alignment in `dims`, and `solve`'s layout
invariants (caps, 3×3 sudoku distinctness, row/column uniqueness, adjacency
restrictions, framing, edge blanks, 2×2 rotation medallions + pinning, exact
combination counting, and determinism). CI runs them before every deploy.

## Layout

- `src/types.ts` — shared domain types (`State`, `TileElement`, `Actions`, …).
- `src/solver.ts` — pure layout engine: grid sizing, backtracking solver,
  solution counting, 2×2 rotation quads, and dispersion optimisation.
- `src/useCalculator.ts` — hook owning state and the action callbacks.
- `src/deriveView.tsx` — pure `(state, actions) → view` derivation; exports the
  inferred `View` type consumed by components.
- `src/components/` — one component per UI section; `components/ui/` holds shared
  primitives (`Toggle`, `Divider`).
- `src/App.tsx` — thin composition of the above.
- `src/css.ts` — small helper that turns inline-style strings into React style
  objects (keeps the markup close to the original design).
- `public/tiles/` — the default tile artwork (A–L).
