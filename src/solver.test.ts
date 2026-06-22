import { describe, it, expect } from 'vitest'
import { rng, textColor, dims, solve } from './solver'
import type { State, TileElement } from './types'

// ---- helpers ----

function els(specs: Array<[string, number, number?]>): TileElement[] {
  return specs.map(([name, quantity, variations = 1]) => ({ name, quantity, variations, color: '#888888' }))
}

function mkState(o: Partial<State> = {}): State {
  return {
    areaW: 100, areaH: 100, tileW: 20, tileH: 20,
    slice: true, alignX: 'right', alignY: 'bottom',
    displayMode: 'image', showLabels: true, seam: true,
    sudoku: false, colUnique: false, rowUnique: false,
    disperse: false, disperseStrength: 3,
    forbiddenPairs: [], fpA: null, fpB: null, even: true,
    elements: els([['A', 50], ['B', 50], ['C', 50], ['D', 50], ['E', 50]]),
    grid: null, vmap: null, warning: null, combos: null, stale: false,
    quadEls: [], quadStart: {}, quadPins: [], placeMode: null,
    frameOn: false, frameWidth: 1, frameColor: '#e7d9b6',
    ...o,
  }
}

function run(state: State, reseed = false) {
  const res = solve(state, reseed)
  const { rows: R, cols: C } = dims(state)
  return { res, grid: (res.grid ?? null) as (number | null)[] | null, R, C }
}

// Check the grid against whichever rules the state has enabled. Empty (-1) and
// frame (-3) cells are skipped. Returns a list of violations (empty == valid).
function validate(grid: (number | null)[], R: number, C: number, state: State): string[] {
  const issues: string[] = []
  const E = state.elements.length
  const caps = state.elements.map((e) => Math.max(0, Math.floor(Number(e.quantity)) || 0))
  const counts = new Array(E).fill(0)
  const at = (r: number, c: number) => grid[r * C + c]

  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const v = at(r, c)
    if (v == null) { issues.push(`null cell at ${r},${c}`); continue }
    if (v < 0) continue
    if (v >= E) { issues.push(`out-of-range element ${v} at ${r},${c}`); continue }
    counts[v]++
  }

  counts.forEach((n, i) => { if (n > caps[i]) issues.push(`cap exceeded for ${state.elements[i].name}: ${n} > ${caps[i]}`) })

  if (state.sudoku) {
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const v = at(r, c); if (v == null || v < 0) continue
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue
        const rr = r + dr, cc = c + dc; if (rr < 0 || rr >= R || cc < 0 || cc >= C) continue
        if (at(rr, cc) === v) issues.push(`sudoku dup of ${v} near ${r},${c}`)
      }
    }
  }

  if (state.colUnique) {
    for (let c = 0; c < C; c++) {
      const seen = new Set<number>()
      for (let r = 0; r < R; r++) { const v = at(r, c); if (v == null || v < 0) continue; if (seen.has(v)) issues.push(`col ${c} dup of ${v}`); seen.add(v) }
    }
  }

  if (state.rowUnique) {
    for (let r = 0; r < R; r++) {
      const seen = new Set<number>()
      for (let c = 0; c < C; c++) { const v = at(r, c); if (v == null || v < 0) continue; if (seen.has(v)) issues.push(`row ${r} dup of ${v}`); seen.add(v) }
    }
  }

  if (state.forbiddenPairs.length) {
    const idx: Record<string, number> = {}
    state.elements.forEach((e, i) => { idx[e.name] = i })
    const forb = new Set<string>()
    for (const p of state.forbiddenPairs) { forb.add(`${idx[p.a]}-${idx[p.b]}`); forb.add(`${idx[p.b]}-${idx[p.a]}`) }
    const dirs = [[0, 1], [1, 0]] as const
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const v = at(r, c); if (v == null || v < 0) continue
      for (const [dr, dc] of dirs) {
        const rr = r + dr, cc = c + dc; if (rr >= R || cc >= C) continue
        const w = at(rr, cc); if (w == null || w < 0) continue
        if (forb.has(`${v}-${w}`)) issues.push(`forbidden adjacency ${v}-${w} at ${r},${c}`)
      }
    }
  }

  return issues
}

// ---- rng ----

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = rng(42), b = rng(42)
    expect(Array.from({ length: 5 }, () => a())).toEqual(Array.from({ length: 5 }, () => b()))
  })
  it('produces values in [0, 1)', () => {
    const r = rng(7)
    for (let i = 0; i < 1000; i++) { const x = r(); expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThan(1) }
  })
  it('differs across seeds', () => {
    expect(rng(1)()).not.toEqual(rng(2)())
  })
})

// ---- textColor ----

describe('textColor', () => {
  it('returns light ink on dark backgrounds', () => {
    expect(textColor('#000000')).toBe('#fff8ec')
    expect(textColor('#27408a')).toBe('#fff8ec')
  })
  it('returns dark ink on light backgrounds', () => {
    expect(textColor('#ffffff')).toBe('#2b2310')
    expect(textColor('#e0a72e')).toBe('#2b2310')
  })
  it('tolerates a missing # prefix', () => {
    expect(textColor('ffffff')).toBe('#2b2310')
  })
})

// ---- dims ----

describe('dims', () => {
  it('divides area by tile size with no remainder', () => {
    const d = dims(mkState({ areaW: 200, areaH: 160, tileW: 20, tileH: 20 }))
    expect(d.cols).toBe(10)
    expect(d.rows).toBe(8)
    expect(d.colSlice.every((s) => !s)).toBe(true)
  })
  it('appends an edge slice on the right when enabled', () => {
    const d = dims(mkState({ areaW: 210, slice: true, alignX: 'right' }))
    expect(d.cols).toBe(11)
    expect(d.colSlice[10]).toBe(true)
    expect(d.remW).toBeCloseTo(10)
  })
  it('places the slice on the left when aligned left', () => {
    const d = dims(mkState({ areaW: 210, slice: true, alignX: 'left' }))
    expect(d.colSlice[0]).toBe(true)
  })
  it('splits the remainder at both ends when aligned even', () => {
    const d = dims(mkState({ areaW: 210, slice: true, alignX: 'even' }))
    expect(d.cols).toBe(12)
    expect(d.colSlice[0]).toBe(true)
    expect(d.colSlice[11]).toBe(true)
  })
  it('ignores the remainder when slicing is off', () => {
    const d = dims(mkState({ areaW: 210, slice: false }))
    expect(d.cols).toBe(10)
  })
  it('always yields at least one track', () => {
    const d = dims(mkState({ areaW: 10, areaH: 10, tileW: 20, tileH: 20, slice: false }))
    expect(d.cols).toBe(1)
    expect(d.rows).toBe(1)
  })
  it('clamps to 40 tracks', () => {
    const d = dims(mkState({ areaW: 2000, areaH: 2000, tileW: 20, tileH: 20 }))
    expect(d.cols).toBe(40)
    expect(d.rows).toBe(40)
  })
})

// ---- solve ----

describe('solve', () => {
  it('fills every cell honoring caps (no rules)', () => {
    const state = mkState({ areaW: 100, areaH: 100 }) // 5x5
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    expect(grid!.length).toBe(R * C)
    expect(validate(grid!, R, C, state)).toEqual([])
    expect(grid!.every((v) => v != null && v >= 0)).toBe(true)
  })

  it('is deterministic when reseed is false', () => {
    const state = mkState({ areaW: 100, areaH: 100, sudoku: true, elements: els([['A', 8], ['B', 8], ['C', 8], ['D', 8], ['E', 8], ['F', 8], ['G', 8], ['H', 8], ['I', 8], ['J', 8], ['K', 8], ['L', 8], ['M', 8]]) })
    expect(solve(state, false).grid).toEqual(solve(state, false).grid)
  })

  it('satisfies the 3x3 (Chebyshev-2) sudoku rule', () => {
    const state = mkState({
      areaW: 80, areaH: 80, sudoku: true,
      elements: els([['A', 4], ['B', 4], ['C', 4], ['D', 4], ['E', 4], ['F', 4], ['G', 4], ['H', 4], ['I', 4], ['J', 4]]),
    })
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    expect(validate(grid!, R, C, state)).toEqual([])
  })

  it('keeps every column distinct when colUnique is on', () => {
    const state = mkState({ areaW: 80, areaH: 80, colUnique: true, elements: els([['A', 8], ['B', 8], ['C', 8], ['D', 8], ['E', 8]]) })
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    expect(validate(grid!, R, C, state)).toEqual([])
  })

  it('keeps every row distinct when rowUnique is on', () => {
    const state = mkState({ areaW: 80, areaH: 80, rowUnique: true, elements: els([['A', 8], ['B', 8], ['C', 8], ['D', 8], ['E', 8]]) })
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    expect(validate(grid!, R, C, state)).toEqual([])
  })

  it('never places a forbidden pair orthogonally adjacent', () => {
    const state = mkState({
      areaW: 80, areaH: 80,
      elements: els([['A', 6], ['B', 6], ['C', 12]]),
      forbiddenPairs: [{ a: 'A', b: 'B' }],
    })
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    expect(validate(grid!, R, C, state)).toEqual([])
  })

  it('reserves a single-colour frame border', () => {
    const state = mkState({ areaW: 120, areaH: 120, frameOn: true, frameWidth: 1 }) // 6x6
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const v = grid![r * C + c]
      const perim = r === 0 || c === 0 || r === R - 1 || c === C - 1
      if (perim) expect(v).toBe(-3)
      else expect(v!).toBeGreaterThanOrEqual(0)
    }
  })

  it('leaves blanks when there are fewer tiles than cells', () => {
    const state = mkState({ areaW: 80, areaH: 80, elements: els([['A', 5]]) }) // 4x4 = 16
    const { grid, R, C } = run(state)
    expect(grid).not.toBeNull()
    expect(grid!.filter((v) => v === 0).length).toBe(5)
    expect(grid!.filter((v) => v === -1).length).toBe(R * C - 5)
  })

  it('places a 2x2 rotation medallion as four rotated tiles', () => {
    const state = mkState({
      areaW: 120, areaH: 120,
      elements: els([['Q', 4, 4], ['A', 40], ['B', 40]]),
      quadEls: ['Q'],
    })
    const res = solve(state, false)
    const { cols: C } = dims(state)
    const grid = res.grid as (number | null)[]
    const vmap = res.vmap as number[]
    expect(grid).not.toBeNull()
    const qi = state.elements.findIndex((e) => e.name === 'Q')
    const qcells = grid.map((v, i) => (v === qi ? i : -1)).filter((i) => i >= 0)
    expect(qcells.length).toBe(4)
    const rs = qcells.map((i) => Math.floor(i / C)), cs = qcells.map((i) => i % C)
    expect(Math.max(...rs) - Math.min(...rs)).toBe(1)
    expect(Math.max(...cs) - Math.min(...cs)).toBe(1)
    expect(qcells.map((i) => vmap[i]).sort()).toEqual([1, 2, 3, 4])
  })

  it('honours a pinned 2x2 position', () => {
    const state = mkState({
      areaW: 120, areaH: 120,
      elements: els([['Q', 4, 4], ['A', 40], ['B', 40]]),
      quadEls: ['Q'], quadPins: [{ name: 'Q', r: 1, c: 1 }],
    })
    const res = solve(state, false)
    const { cols: C } = dims(state)
    const grid = res.grid as (number | null)[]
    const qi = state.elements.findIndex((e) => e.name === 'Q')
    for (const [r, c] of [[1, 1], [1, 2], [2, 1], [2, 2]] as const) {
      expect(grid[r * C + c]).toBe(qi)
    }
  })

  it('counts exact arrangements for a tiny row-unique case', () => {
    const state = mkState({ areaW: 60, areaH: 20, rowUnique: true, elements: els([['A', 1], ['B', 1], ['C', 1]]) }) // 1x3
    const res = solve(state, false)
    expect(res.combos).not.toBeNull()
    expect(res.combos!.total).toBe(6) // 3! permutations
    expect(res.combos!.capped).toBe(false)
  })

  it('does not count combinations when quads are present', () => {
    const state = mkState({ areaW: 120, areaH: 120, elements: els([['Q', 4, 4], ['A', 40]]), quadEls: ['Q'] })
    expect(solve(state, false).combos).toBeNull()
  })

  it('warns when there are no elements', () => {
    const res = solve(mkState({ elements: [] }), false)
    expect(res.grid).toBeNull()
    expect(res.warning).toContain('請至少新增一個元素')
  })
})
