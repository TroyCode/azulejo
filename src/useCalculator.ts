import { useEffect, useRef, useState } from 'react'
import { solve } from './solver'
import { INITIAL, PALETTE } from './constants'
import type { Actions, State, TileElement } from './types'

// Owns all calculator state and the actions that mutate it. Returns the current
// state plus a bag of action callbacks; view derivation lives in deriveView()
// so this hook stays free of presentation concerns.
export function useCalculator(): { state: State; actions: Actions } {
  const [state, setState] = useState<State>(INITIAL)
  const stateRef = useRef<State>(state)
  stateRef.current = state
  const dragIndex = useRef<number | null>(null)

  const merge = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }))

  // ---- solve / shuffle ----
  const reshuffle = () => merge(solve(stateRef.current, true))
  useEffect(() => { merge(solve(stateRef.current, true)) }, [])

  // ---- editing ----
  const updateEl = (i: number, field: 'name' | 'quantity' | 'variations' | 'color', value: string) => setState((s) => {
    const elements = s.elements.map((el, j) => (j === i ? ({ ...el, [field]: value } as TileElement) : el))
    const patch: Partial<State> = { elements }
    if (field === 'quantity') patch.stale = true
    return { ...s, ...patch }
  })
  const removeEl = (i: number) => setState((s) => (s.elements.length <= 1 ? s : { ...s, elements: s.elements.filter((_, j) => j !== i), stale: true }))
  const addEl = () => setState((s) => {
    const els = s.elements
    const used = els.map((e) => e.color)
    const color = PALETTE.find((c) => !used.includes(c)) || PALETTE[els.length % PALETTE.length]
    let name = '?'
    for (let k = 0; k < 26; k++) { const n = String.fromCharCode(65 + k); if (!els.some((e) => e.name === n)) { name = n; break } }
    return { ...s, elements: [...els, { name, quantity: 6, variations: 1, color }], stale: true }
  })
  const reorder = (from: number | null, to: number | null) => setState((s) => {
    if (from == null || to == null || from === to) return s
    const els = [...s.elements]
    const [m] = els.splice(from, 1)
    els.splice(to, 0, m)
    dragIndex.current = null
    return { ...s, elements: els, stale: true }
  })
  const setArea = (field: 'areaW' | 'areaH', val: string | number) => merge({ [field]: Math.max(0, Number(val) || 0), stale: true } as Partial<State>)
  const setTile = (field: 'tileW' | 'tileH', val: string | number) => merge({ [field]: Math.max(1, Number(val) || 1), stale: true } as Partial<State>)
  const toggleSlice = () => setState((s) => ({ ...s, slice: !s.slice, stale: true }))
  const setAlign = (field: 'alignX' | 'alignY', val: string) => merge({ [field]: val, stale: true } as Partial<State>)
  const setMode = (val: string) => merge({ displayMode: val })
  const toggleLabels = () => setState((s) => ({ ...s, showLabels: !s.showLabels }))
  const toggleSeam = () => setState((s) => ({ ...s, seam: !s.seam }))
  const toggleColUnique = () => setState((s) => ({ ...s, colUnique: !s.colUnique, stale: true }))
  const toggleRowUnique = () => setState((s) => ({ ...s, rowUnique: !s.rowUnique, stale: true }))
  const toggleDisperse = () => setState((s) => ({ ...s, disperse: !s.disperse, stale: true }))
  const setDispStrength = (val: string | number) => merge({ disperseStrength: Math.max(1, Math.min(5, Math.round(Number(val)) || 1)), stale: true })
  const setFp = (field: 'fpA' | 'fpB', val: string) => merge({ [field]: val } as Partial<State>)
  const addForbidden = () => setState((s) => {
    const names = s.elements.map((e) => e.name)
    const a = s.fpA ?? names[0]
    const b = s.fpB ?? (names[1] ?? names[0])
    if (!a || !b || a === b) return s
    const exists = s.forbiddenPairs.some((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a))
    if (exists) return s
    return { ...s, forbiddenPairs: [...s.forbiddenPairs, { a, b }], stale: true }
  })
  const removeForbidden = (i: number) => setState((s) => ({ ...s, forbiddenPairs: s.forbiddenPairs.filter((_, j) => j !== i), stale: true }))
  const toggleQuad = (name: string) => setState((s) => {
    const set = s.quadEls || []
    return { ...s, quadEls: set.includes(name) ? set.filter((n) => n !== name) : [...set, name], stale: true }
  })
  const setQuadBlockStart = (name: string, idx: number, deg: number) => setState((s) => {
    const map = { ...(s.quadStart || {}) }
    const arr = (map[name] || []).slice()
    arr[idx] = deg; map[name] = arr
    return { ...s, quadStart: map, stale: true }
  })
  const setPlaceMode = (name: string) => setState((s) => ({ ...s, placeMode: s.placeMode === name ? null : name }))
  const pinAt = (r: number, c: number) => setState((s) => {
    const nm = s.placeMode; if (!nm) return s
    const pins = (s.quadPins || []).slice()
    const at = pins.findIndex((p) => p.name === nm && p.r === r && p.c === c)
    if (at >= 0) pins.splice(at, 1); else pins.push({ name: nm, r, c })
    return { ...s, quadPins: pins, stale: true }
  })
  const clearPins = (name: string) => setState((s) => ({ ...s, quadPins: (s.quadPins || []).filter((p) => p.name !== name), stale: true }))
  const toggleFrame = () => setState((s) => ({ ...s, frameOn: !s.frameOn, stale: true }))
  const setFrameWidth = (val: string | number) => merge({ frameWidth: Math.max(1, Math.min(10, Math.floor(Number(val)) || 1)), stale: true })
  const setFrameColor = (val: string) => merge({ frameColor: val })
  const setImg = (i: number, file: File | null | undefined) => {
    if (!file) return
    const rd = new FileReader()
    rd.onload = () => setState((s) => ({ ...s, elements: s.elements.map((el, j) => (j === i ? ({ ...el, img: rd.result as string }) : el)) }))
    rd.readAsDataURL(file)
  }
  const clearImg = (i: number) => setState((s) => ({ ...s, elements: s.elements.map((el, j) => (j === i ? ({ ...el, img: '' }) : el)) }))
  const toggleSudoku = () => setState((s) => ({ ...s, sudoku: !s.sudoku, stale: true }))
  const toggleEven = () => setState((s) => ({ ...s, even: !s.even, stale: true }))

  const actions: Actions = {
    reshuffle, updateEl, removeEl, addEl, reorder, setArea, setTile, toggleSlice, setAlign,
    setMode, toggleLabels, toggleSeam, toggleColUnique, toggleRowUnique, toggleDisperse,
    setDispStrength, setFp, addForbidden, removeForbidden, toggleQuad, setQuadBlockStart,
    setPlaceMode, pinAt, clearPins, toggleFrame, setFrameWidth, setFrameColor, setImg,
    clearImg, toggleSudoku, toggleEven, dragIndex,
  }
  return { state, actions }
}
