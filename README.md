# 花磚排列計算器 · Azulejo

A tile-layout calculator that arranges patterned (azulejo) tiles so that every
3×3 window is distinct (Sudoku-like), with controls for area/tile sizing, edge
slicing, adjacency restrictions, 2×2 rotation medallions, framing, and
simulated-annealing dispersion.

Ported from a Claude Design prototype (`花磚排列計算器.dc.html`) to a standalone
React + Vite app — no proprietary runtime.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Layout

- `src/solver.js` — pure layout engine: grid sizing, backtracking solver,
  solution counting, 2×2 rotation quads, and dispersion optimisation.
- `src/App.jsx` — UI and state; derives all view values from the current state.
- `src/css.js` — small helper that turns inline-style strings into React style
  objects (keeps the markup close to the original design).
- `public/tiles/` — the default tile artwork (A–L).
