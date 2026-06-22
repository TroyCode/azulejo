import type { State, Combos } from './types'

// Adjacency restrictions: forb[a][b] === true means a and b may not touch.
type Forb = (Record<number, boolean> | null)[] | null

// ---- deterministic PRNG (mulberry32) ----
export function rng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

// ---- readable text colour for a given background hex ----
export function textColor(hex: string): string {
  const h = (hex || '#000000').replace('#', '')
  const r = parseInt(h.substring(0, 2), 16) || 0
  const g = parseInt(h.substring(2, 4), 16) || 0
  const b = parseInt(h.substring(4, 6), 16) || 0
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.62 ? '#2b2310' : '#fff8ec'
}

// ---- derive grid track layout from area ÷ tile size (+ edge slices & alignment) ----
export function dims(state: State) {
  const aw = Math.max(1, Number(state.areaW) || 0)
  const ah = Math.max(1, Number(state.areaH) || 0)
  const tw = Math.max(1, Number(state.tileW) || 1)
  const th = Math.max(1, Number(state.tileH) || 1)
  const fullCols = Math.floor(aw / tw)
  const fullRows = Math.floor(ah / th)
  const remW = +(aw - fullCols * tw).toFixed(2)
  const remH = +(ah - fullRows * th).toFixed(2)
  const sliceX = state.slice && remW > 0.05
  const sliceY = state.slice && remH > 0.05

  const buildTracks = (full: number, t: number, rem: number, sliced: boolean, align: string) => {
    const w: number[] = [], isS: boolean[] = []
    const pushFull = () => { for (let i = 0; i < full; i++) { w.push(t); isS.push(false) } }
    if (!sliced || (full === 0 && rem <= 0.05)) { pushFull(); if (w.length === 0) { w.push(t); isS.push(false) } return { w, isS } }
    if (!sliced) { pushFull(); return { w, isS } }
    if (align === 'left' || align === 'top') { w.push(rem); isS.push(true); pushFull() }
    else if (align === 'even') { const h = +(rem / 2).toFixed(2); w.push(h); isS.push(true); pushFull(); w.push(h); isS.push(true) }
    else { pushFull(); w.push(rem); isS.push(true) }
    return { w, isS }
  }

  let { w: colW, isS: colSlice } = buildTracks(fullCols, tw, remW, sliceX, state.alignX)
  let { w: rowH, isS: rowSlice } = buildTracks(fullRows, th, remH, sliceY, state.alignY)
  // clamp to 40 tracks max
  if (colW.length > 40) { colW = colW.slice(0, 40); colSlice = colSlice.slice(0, 40) }
  if (rowH.length > 40) { rowH = rowH.slice(0, 40); rowSlice = rowSlice.slice(0, 40) }
  return { rows: rowH.length, cols: colW.length, colW, colSlice, rowH, rowSlice, fullRows, fullCols, remW, remH, sliceX, sliceY, tw, th }
}

// ---- single-pass backtracking solver ----
function solveOnce(
  rows: number, cols: number, E: number, caps: number[], sudoku: boolean, even: boolean,
  seed: number, cells: number, allowEmpty: boolean, colUnique: boolean, rowUnique: boolean,
  forb: Forb, quadSet: boolean[] | null, quadStartList: (number[] | null)[], fw: number,
  quadPinsByE: number[][] | null, medallionsOnly?: boolean,
): { grid: (number | null)[]; vmap: number[] } | null {
  const rand = rng(seed)
  const grid: (number | null)[] = new Array(cells).fill(null)
  const vmap: number[] = new Array(cells).fill(0) // explicit variation for quad cells (0 = derive normally)
  const counts: number[] = new Array(E).fill(0)
  const idx = (r: number, c: number) => r * cols + c

  // reserve perimeter frame cells (not tiled)
  if (fw > 0) { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (r < fw || r >= rows - fw || c < fw || c >= cols - fw) grid[idx(r, c)] = -3 }

  // pre-place 2x2 rotation quads (pinwheel: TL=1/0°, TR=2/90°, BR=3/180°, BL=4/270°)
  if (quadSet) {
    const pinned: { e: number; s: number; pin: number }[] = []
    const floating: { e: number; s: number }[] = []
    for (let e = 0; e < E; e++) if (quadSet[e]) {
      const n = Math.floor(caps[e] / 4)
      const pins = (quadPinsByE && quadPinsByE[e]) ? quadPinsByE[e] : []
      for (let k = 0; k < n; k++) {
        const s = (quadStartList && quadStartList[e] && quadStartList[e]![k]) ? quadStartList[e]![k] : 1
        if (k < pins.length) pinned.push({ e, s, pin: pins[k] }); else floating.push({ e, s })
      }
    }
    const putBlock = (e: number, p: number, s: number) => {
      const r = (p / cols) | 0, c = p % cols
      const p00 = p, p01 = idx(r, c + 1), p10 = idx(r + 1, c), p11 = idx(r + 1, c + 1)
      const vv = (k: number) => ((s - 1 + k) % 4) + 1
      grid[p00] = e; vmap[p00] = vv(0); grid[p01] = e; vmap[p01] = vv(1); grid[p11] = e; vmap[p11] = vv(2); grid[p10] = e; vmap[p10] = vv(3)
      counts[e] += 4
    }
    // 1) place pinned blocks at exact positions (must fit & be empty)
    for (const blk of pinned) {
      const p = blk.pin; const r = (p / cols) | 0, c = p % cols
      if (r < 0 || r >= rows - 1 || c < 0 || c >= cols - 1) { if (medallionsOnly) continue; return null }
      const p00 = p, p01 = idx(r, c + 1), p10 = idx(r + 1, c), p11 = idx(r + 1, c + 1)
      if (grid[p00] !== null || grid[p01] !== null || grid[p10] !== null || grid[p11] !== null) { if (medallionsOnly) continue; return null }
      putBlock(blk.e, p, blk.s)
    }
    // 2) place floating blocks at random free 2x2 windows
    if (floating.length) {
      const tl: number[] = []
      for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) tl.push(r * cols + c)
      for (let i = tl.length - 1; i > 0; i--) { const j = (rand() * (i + 1)) | 0; const t = tl[i]; tl[i] = tl[j]; tl[j] = t }
      for (let i = floating.length - 1; i > 0; i--) { const j = (rand() * (i + 1)) | 0; const t = floating[i]; floating[i] = floating[j]; floating[j] = t }
      for (const blk of floating) {
        const e = blk.e
        let placed = false
        for (let t = 0; t < tl.length; t++) {
          const p = tl[t]; const r = (p / cols) | 0, c = p % cols
          const p00 = p, p01 = idx(r, c + 1), p10 = idx(r + 1, c), p11 = idx(r + 1, c + 1)
          if (grid[p00] !== null || grid[p01] !== null || grid[p10] !== null || grid[p11] !== null) continue
          // keep same-element medallions from touching (1-cell gap)
          let near = false
          for (let dr = -1; dr <= 2 && !near; dr++) for (let dc = -1; dc <= 2; dc++) {
            const rr = r + dr, cc = c + dc; if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue
            if ((dr >= 0 && dr <= 1 && dc >= 0 && dc <= 1)) continue // inside block
            if (grid[idx(rr, cc)] === e) { near = true; break }
          }
          if (near) continue
          putBlock(e, p, blk.s); placed = true; break
        }
        if (!placed && !medallionsOnly) return null
      }
    }
  }

  // medallions-only fallback: leave the rest empty (degraded preview when full fill is infeasible)
  if (medallionsOnly) {
    for (let i = 0; i < cells; i++) if (grid[i] === null) grid[i] = -1
    return { grid: grid.slice(), vmap: vmap.slice() }
  }

  const conflict = (r: number, c: number, e: number): boolean => {
    if (sudoku) {
      for (let dr = -2; dr <= 2; dr++) {
        const rr = r + dr; if (rr < 0 || rr >= rows) continue
        for (let dc = -2; dc <= 2; dc++) {
          const cc = c + dc; if (cc < 0 || cc >= cols) continue
          if (grid[idx(rr, cc)] === e) return true
        }
      }
    }
    if (colUnique) { for (let rr = 0; rr < rows; rr++) if (grid[idx(rr, c)] === e) return true }
    if (rowUnique) { for (let cc = 0; cc < cols; cc++) if (grid[idx(r, cc)] === e) return true }
    if (forb && forb[e]) {
      const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      for (let k = 0; k < 4; k++) { const rr = nb[k][0], cc = nb[k][1]; if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue; const f = grid[idx(rr, cc)]; if (f != null && f >= 0 && forb[e]![f]) return true }
    }
    return false
  }
  let nodes = 0
  const budget = quadSet ? 4000000 : 500000
  const rec = (pos: number): boolean => {
    if (nodes++ > budget) throw 'budget'
    if (pos === cells) return true
    if (grid[pos] !== null) return rec(pos + 1) // already filled by a quad block
    const r = (pos / cols) | 0, c = pos % cols
    const cand: { e: number; k: number; j: number }[] = []
    for (let e = 0; e < E; e++) {
      if (quadSet && quadSet[e]) continue // quad elements only appear as 2x2 blocks
      if (counts[e] >= caps[e]) continue
      if (conflict(r, c, e)) continue
      cand.push({ e, k: even ? (counts[e] + rand() * 2.5) : e, j: rand() })
    }
    cand.sort((a, b) => (a.k - b.k) || (a.j - b.j))
    for (const { e } of cand) {
      grid[idx(r, c)] = e; counts[e]++
      if (rec(pos + 1)) return true
      counts[e]--; grid[idx(r, c)] = null
    }
    if (allowEmpty) {
      grid[idx(r, c)] = -1
      if (rec(pos + 1)) return true
      grid[idx(r, c)] = null
    }
    return false
  }
  try { if (rec(0)) return { grid: grid.slice(), vmap: vmap.slice() } } catch { return null }
  return null
}

// ---- count distinct valid arrangements (capped + time-budgeted) ----
function countSolutions(
  R: number, C: number, E: number, caps: number[], sudoku: boolean, cells: number,
  allowEmpty: boolean, capN: number, budgetMs: number, colUnique: boolean, rowUnique: boolean,
  forb: Forb, fw: number,
): Combos {
  const counts: number[] = new Array(E).fill(0)
  const grid: number[] = new Array(cells).fill(-2)
  const idx = (r: number, c: number) => r * C + c
  if (fw > 0) { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (r < fw || r >= R - fw || c < fw || c >= C - fw) grid[idx(r, c)] = -3 }
  const conflict = (r: number, c: number, e: number): boolean => {
    if (sudoku) {
      for (let dr = -2; dr <= 2; dr++) { const rr = r + dr; if (rr < 0 || rr >= R) continue
        for (let dc = -2; dc <= 2; dc++) { const cc = c + dc; if (cc < 0 || cc >= C) continue
          if (grid[idx(rr, cc)] === e) return true } }
    }
    if (colUnique) { for (let rr = 0; rr < R; rr++) if (grid[idx(rr, c)] === e) return true }
    if (rowUnique) { for (let cc = 0; cc < C; cc++) if (grid[idx(r, cc)] === e) return true }
    if (forb && forb[e]) {
      const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      for (let k = 0; k < 4; k++) { const rr = nb[k][0], cc = nb[k][1]; if (rr < 0 || rr >= R || cc < 0 || cc >= C) continue; const f = grid[idx(rr, cc)]; if (f >= 0 && forb[e]![f]) return true }
    }
    return false
  }
  let total = 0, stop = false, timedOut = false
  const t0 = Date.now()
  let opCount = 0
  const rec = (pos: number): void => {
    if (stop) return
    if ((++opCount & 8191) === 0 && Date.now() - t0 > budgetMs) { stop = true; timedOut = true; return }
    if (pos === cells) { total++; if (total >= capN) stop = true; return }
    if (grid[pos] === -3) { rec(pos + 1); return }
    const r = (pos / C) | 0, c = pos % C
    // try least-used elements first so full arrangements complete quickly
    const cand: number[] = []
    for (let e = 0; e < E; e++) {
      if (counts[e] >= caps[e]) continue
      if (conflict(r, c, e)) continue
      cand.push(e)
    }
    cand.sort((p, q) => counts[p] - counts[q])
    for (let i = 0; i < cand.length; i++) {
      const e = cand[i]
      grid[idx(r, c)] = e; counts[e]++
      rec(pos + 1)
      counts[e]--; grid[idx(r, c)] = -2
      if (stop) return
    }
    if (allowEmpty) { grid[idx(r, c)] = -1; rec(pos + 1); grid[idx(r, c)] = -2 }
  }
  rec(0)
  return { total, capped: total >= capN, timedOut }
}

// ---- simulated-annealing dispersion: swap tiles to spread same elements apart ----
function optimizeSpread(
  grid: number[], R: number, C: number, sudoku: boolean, colUnique: boolean, rowUnique: boolean,
  strength: number, seed: number, forb: Forb, vmap: number[] | null,
): number[] {
  const rand = rng(seed)
  const idx = (r: number, c: number) => r * C + c
  const groupPen = (ps: number[]) => {
    let s = 0
    for (let a = 0; a < ps.length; a++) for (let b = a + 1; b < ps.length; b++) {
      const d = Math.abs(((ps[a] / C) | 0) - ((ps[b] / C) | 0)) + Math.abs((ps[a] % C) - (ps[b] % C))
      s += 1 / (d * d)
    }
    return s
  }
  // full validity of the element currently at position p (grid already holds tentative values)
  const okAt = (p: number) => {
    const e = grid[p]; if (e < 0) return true
    const r = (p / C) | 0, c = p % C
    if (sudoku) { for (let dr = -2; dr <= 2; dr++) { const rr = r + dr; if (rr < 0 || rr >= R) continue
      for (let dc = -2; dc <= 2; dc++) { const cc = c + dc; if (cc < 0 || cc >= C) continue; const q = idx(rr, cc); if (q !== p && grid[q] === e) return false } } }
    if (colUnique) { for (let rr = 0; rr < R; rr++) { const q = idx(rr, c); if (q !== p && grid[q] === e) return false } }
    if (rowUnique) { for (let cc = 0; cc < C; cc++) { const q = idx(r, cc); if (q !== p && grid[q] === e) return false } }
    if (forb && forb[e]) { const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      for (let k = 0; k < 4; k++) { const rr = nb[k][0], cc = nb[k][1]; if (rr < 0 || rr >= R || cc < 0 || cc >= C) continue; const f = grid[idx(rr, cc)]; if (f >= 0 && forb[e]![f]) return false } }
    return true
  }
  const posByEl = new Map<number, number[]>()
  const filled: number[] = []
  for (let i = 0; i < grid.length; i++) { if (vmap && vmap[i] > 0) continue; const e = grid[i]; if (e >= 0) { filled.push(i); if (!posByEl.has(e)) posByEl.set(e, []); posByEl.get(e)!.push(i) } }
  if (filled.length < 2) return grid
  const cells = grid.length
  const iters = Math.min(120000, Math.max(2000, strength * cells * 12))
  let T = 0.6; const cool = Math.pow(0.0008 / 0.6, 1 / iters)
  const t0 = Date.now()
  for (let it = 0; it < iters; it++) {
    if ((it & 4095) === 0 && Date.now() - t0 > 2500) break
    const a = filled[(rand() * filled.length) | 0]
    const b = filled[(rand() * filled.length) | 0]
    if (a === b) { T *= cool; continue }
    const ea = grid[a], eb = grid[b]
    if (ea === eb) { T *= cool; continue }
    grid[a] = eb; grid[b] = ea // tentative swap
    if (!okAt(a) || !okAt(b)) { grid[a] = ea; grid[b] = eb; T *= cool; continue }
    const pa = posByEl.get(ea)!, pb = posByEl.get(eb)!
    const pa2 = pa.map(x => x === a ? b : x)
    const pb2 = pb.map(x => x === b ? a : x)
    const delta = (groupPen(pa2) + groupPen(pb2)) - (groupPen(pa) + groupPen(pb))
    if (delta <= 0 || rand() < Math.exp(-delta / T)) {
      posByEl.set(ea, pa2); posByEl.set(eb, pb2)
    } else {
      grid[a] = ea; grid[b] = eb // revert
    }
    T *= cool
  }
  return grid
}

// ---- top-level solve: returns a state patch { grid, vmap, warning, stale, combos } ----
export function solve(state: State, reseed: boolean): Partial<State> {
  const { sudoku, even, elements, colUnique, rowUnique, disperse, disperseStrength, forbiddenPairs, quadEls, quadStart, frameOn, frameWidth, quadPins } = state
  const { rows: R, cols: C } = dims(state)
  const E = elements.length
  const cells = R * C
  const fw = frameOn ? Math.max(0, Math.min(Math.floor(Math.min(R, C) / 2), Math.floor(Number(frameWidth)) || 0)) : 0
  const interiorCells = Math.max(0, R - 2 * fw) * Math.max(0, C - 2 * fw)
  const caps = elements.map(e => Math.max(0, Math.floor(Number(e.quantity)) || 0))
  // quad elements (2x2 rotation groups): need 4 variations & at least one full block
  let quadSet: boolean[] | null = null
  let quadCells = 0
  const quadStartArr: (number[] | null)[] = elements.map(() => null)
  ;(quadEls || []).forEach(nm => {
    const i = elements.findIndex(el => el.name === nm)
    if (i < 0) return
    const vc = Math.max(1, Math.floor(Number(elements[i].variations)) || 1)
    const blocks = Math.floor(caps[i] / 4)
    if (vc === 4 && blocks >= 1) {
      if (!quadSet) quadSet = elements.map(() => false)
      quadSet[i] = true; quadCells += blocks * 4
      const arr = (quadStart || {})[nm] || []
      quadStartArr[i] = Array.from({ length: blocks }, (_, k) => (Math.round((Number(arr[k]) || 0) / 90) % 4) + 1)
    }
  })
  void quadCells
  const effCap = caps.map((c, i) => (quadSet && quadSet[i]) ? (Math.floor(c / 4) * 4) : c)
  const totalCap = effCap.reduce((a, b) => a + b, 0)
  const allowEmpty = totalCap < interiorCells

  if (E === 0) { return { grid: null, warning: '請至少新增一個元素。', stale: false, combos: null } }

  const nameIdx: Record<string, number> = {}
  elements.forEach((el, i) => { nameIdx[el.name] = i })
  let forb: Forb = null
  for (const p of (forbiddenPairs || [])) {
    const i = nameIdx[p.a], j = nameIdx[p.b]
    if (i != null && j != null && i !== j) {
      if (!forb) forb = elements.map((): Record<number, boolean> | null => null)
      if (!forb[i]) forb[i] = {}
      if (!forb[j]) forb[j] = {}
      forb[i]![j] = true
      forb[j]![i] = true
    }
  }

  // pinned 2x2 positions per element (top-left index), valid & within block count
  let quadPinsByE: number[][] | null = null
  if (quadSet) {
    const byE: number[][] = elements.map((): number[] => [])
    const nm2i: Record<string, number> = {}
    elements.forEach((el, i) => { nm2i[el.name] = i })
    for (const pin of (quadPins || [])) {
      const i = nm2i[pin.name]
      if (i == null || !quadSet[i]) continue
      const r = pin.r, c = pin.c
      // 2x2 top-left must keep all 4 cells inside the interior (outside frame)
      if (r < fw || c < fw || r + 1 > R - 1 - fw || c + 1 > C - 1 - fw) continue
      const maxBlocks = Math.floor(caps[i] / 4)
      if (byE[i].length >= maxBlocks) continue
      byE[i].push(r * C + c)
    }
    quadPinsByE = byE
  }

  const base = reseed ? (Date.now() % 2147483647) : 12345
  let res: { grid: (number | null)[]; vmap: number[] } | null = null
  const t0 = Date.now()
  for (let a = 0; a < 20000 && !res; a++) {
    res = solveOnce(R, C, E, caps, sudoku, even, base + a * 1013904223, cells, allowEmpty, colUnique, rowUnique, forb, quadSet, quadStartArr, fw, quadPinsByE)
    if (Date.now() - t0 > (quadSet ? 7000 : 3500)) break
  }

  if (!res) {
    // degraded fallback: show pinned/floating medallions, leave rest empty, with a clear message
    if (quadSet) {
      const partial = solveOnce(R, C, E, caps, sudoku, even, base, cells, allowEmpty, colUnique, rowUnique, forb, quadSet, quadStartArr, fw, quadPinsByE, true)
      if (partial) {
        return { grid: partial.grid, vmap: partial.vmap, warning: '在目前限制下無法把其餘格子填滿 — 已先放上指定的 2×2 醫章。請把醫章位置錯開(避免同列/同欄太近)、減少醫章、或放寬九宮格等規則。', stale: false, combos: null }
      }
    }
    return { grid: null, vmap: null, warning: '在目前限制下找不到合法排列 — 請關閉部分規則(九宮格/直排/橫排不重複)、減少 2×2 旋轉組、增加元素數量,或調整尺寸後再試。', stale: false, combos: null }
  }
  let grid: (number | null)[] = res.grid
  const vmap = res.vmap
  let warning: string | null = null
  if (allowEmpty) warning = '可填磁磚總數(' + totalCap + ')少於內圈格子數(' + interiorCells + '),已有 ' + (interiorCells - totalCap) + ' 格留白。'
  if (disperse) grid = optimizeSpread(grid as number[], R, C, sudoku, colUnique, rowUnique, disperseStrength, base ^ 0x9e3779b9, forb, vmap)
  const combos = quadSet ? null : countSolutions(R, C, E, caps, sudoku, cells, allowEmpty, 1000000, 700, colUnique, rowUnique, forb, fw)
  return { grid, vmap, warning, stale: false, combos }
}
