import { useEffect, useRef, useState } from 'react'
import { solve } from './solver.js'
import { INITIAL, PALETTE } from './constants.js'

// Owns all calculator state and the actions that mutate it. Returns the current
// state plus a stable bag of action callbacks; view derivation lives in
// deriveView() so this hook stays free of presentation concerns.
export function useCalculator() {
  const [state, setState] = useState(INITIAL)
  const stateRef = useRef(state)
  stateRef.current = state
  const dragIndex = useRef(null)

  const merge = (patch) => setState((s) => ({ ...s, ...patch }))

  // ---- solve / shuffle ----
  const reshuffle = () => merge(solve(stateRef.current, true))
  useEffect(() => { merge(solve(stateRef.current, true)) }, [])

  // ---- editing ----
  const updateEl = (i, field, value) => setState((s) => {
    const elements = s.elements.map((el, j) => (j === i ? { ...el, [field]: value } : el))
    const patch = { elements }
    if (field === 'quantity') patch.stale = true
    return { ...s, ...patch }
  })
  const removeEl = (i) => setState((s) => (s.elements.length <= 1 ? s : { ...s, elements: s.elements.filter((_, j) => j !== i), stale: true }))
  const addEl = () => setState((s) => {
    const els = s.elements
    const used = els.map((e) => e.color)
    const color = PALETTE.find((c) => !used.includes(c)) || PALETTE[els.length % PALETTE.length]
    let name = '?'
    for (let k = 0; k < 26; k++) { const n = String.fromCharCode(65 + k); if (!els.some((e) => e.name === n)) { name = n; break } }
    return { ...s, elements: [...els, { name, quantity: 6, variations: 1, color }], stale: true }
  })
  const reorder = (from, to) => setState((s) => {
    if (from == null || to == null || from === to) return s
    const els = [...s.elements]
    const [m] = els.splice(from, 1)
    els.splice(to, 0, m)
    dragIndex.current = null
    return { ...s, elements: els, stale: true }
  })
  const setArea = (field, val) => merge({ [field]: Math.max(0, Number(val) || 0), stale: true })
  const setTile = (field, val) => merge({ [field]: Math.max(1, Number(val) || 1), stale: true })
  const toggleSlice = () => setState((s) => ({ ...s, slice: !s.slice, stale: true }))
  const setAlign = (field, val) => merge({ [field]: val, stale: true })
  const setMode = (val) => merge({ displayMode: val })
  const toggleLabels = () => setState((s) => ({ ...s, showLabels: !s.showLabels }))
  const toggleSeam = () => setState((s) => ({ ...s, seam: !s.seam }))
  const toggleColUnique = () => setState((s) => ({ ...s, colUnique: !s.colUnique, stale: true }))
  const toggleRowUnique = () => setState((s) => ({ ...s, rowUnique: !s.rowUnique, stale: true }))
  const toggleDisperse = () => setState((s) => ({ ...s, disperse: !s.disperse, stale: true }))
  const setDispStrength = (val) => merge({ disperseStrength: Math.max(1, Math.min(5, Math.round(Number(val)) || 1)), stale: true })
  const setFp = (field, val) => merge({ [field]: val })
  const addForbidden = () => setState((s) => {
    const names = s.elements.map((e) => e.name)
    const a = s.fpA ?? names[0]
    const b = s.fpB ?? (names[1] ?? names[0])
    if (!a || !b || a === b) return s
    const exists = s.forbiddenPairs.some((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a))
    if (exists) return s
    return { ...s, forbiddenPairs: [...s.forbiddenPairs, { a, b }], stale: true }
  })
  const removeForbidden = (i) => setState((s) => ({ ...s, forbiddenPairs: s.forbiddenPairs.filter((_, j) => j !== i), stale: true }))
  const toggleQuad = (name) => setState((s) => {
    const set = s.quadEls || []
    return { ...s, quadEls: set.includes(name) ? set.filter((n) => n !== name) : [...set, name], stale: true }
  })
  const setQuadBlockStart = (name, idx, deg) => setState((s) => {
    const map = { ...(s.quadStart || {}) }
    const arr = (map[name] || []).slice()
    arr[idx] = deg; map[name] = arr
    return { ...s, quadStart: map, stale: true }
  })
  const setPlaceMode = (name) => setState((s) => ({ ...s, placeMode: s.placeMode === name ? null : name }))
  const pinAt = (r, c) => setState((s) => {
    const nm = s.placeMode; if (!nm) return s
    const pins = (s.quadPins || []).slice()
    const at = pins.findIndex((p) => p.name === nm && p.r === r && p.c === c)
    if (at >= 0) pins.splice(at, 1); else pins.push({ name: nm, r, c })
    return { ...s, quadPins: pins, stale: true }
  })
  const clearPins = (name) => setState((s) => ({ ...s, quadPins: (s.quadPins || []).filter((p) => p.name !== name), stale: true }))
  const toggleFrame = () => setState((s) => ({ ...s, frameOn: !s.frameOn, stale: true }))
  const setFrameWidth = (val) => merge({ frameWidth: Math.max(1, Math.min(10, Math.floor(Number(val)) || 1)), stale: true })
  const setFrameColor = (val) => merge({ frameColor: val })
  const setImg = (i, file) => {
    if (!file) return
    const rd = new FileReader()
    rd.onload = () => setState((s) => ({ ...s, elements: s.elements.map((el, j) => (j === i ? { ...el, img: rd.result } : el)) }))
    rd.readAsDataURL(file)
  }
  const clearImg = (i) => setState((s) => ({ ...s, elements: s.elements.map((el, j) => (j === i ? { ...el, img: '' } : el)) }))
  const toggleSudoku = () => setState((s) => ({ ...s, sudoku: !s.sudoku, stale: true }))
  const toggleEven = () => setState((s) => ({ ...s, even: !s.even, stale: true }))

  const actions = {
    reshuffle, updateEl, removeEl, addEl, reorder, setArea, setTile, toggleSlice, setAlign,
    setMode, toggleLabels, toggleSeam, toggleColUnique, toggleRowUnique, toggleDisperse,
    setDispStrength, setFp, addForbidden, removeForbidden, toggleQuad, setQuadBlockStart,
    setPlaceMode, pinAt, clearPins, toggleFrame, setFrameWidth, setFrameColor, setImg,
    clearImg, toggleSudoku, toggleEven, dragIndex,
  }
  return { state, actions }
}
