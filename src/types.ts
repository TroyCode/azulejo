import type { MutableRefObject } from 'react'

// Quantity / variations are edited via text inputs, so they may be a raw string
// mid-edit; solver and view code coerce with Number().
export type Numeric = number | string

export interface TileElement {
  name: string
  quantity: Numeric
  variations: Numeric
  color: string
  img?: string
}

export interface ForbiddenPair {
  a: string
  b: string
}

export interface QuadPin {
  name: string
  r: number
  c: number
}

export interface Combos {
  total: number
  capped: boolean
  timedOut: boolean
}

export interface State {
  areaW: number
  areaH: number
  tileW: number
  tileH: number
  slice: boolean
  alignX: string
  alignY: string
  displayMode: string
  showLabels: boolean
  seam: boolean
  sudoku: boolean
  colUnique: boolean
  rowUnique: boolean
  disperse: boolean
  disperseStrength: number
  forbiddenPairs: ForbiddenPair[]
  fpA: string | null
  fpB: string | null
  even: boolean
  elements: TileElement[]
  grid: (number | null)[] | null
  vmap: number[] | null
  warning: string | null
  combos: Combos | null
  stale: boolean
  quadEls: string[]
  quadStart: Record<string, number[]>
  quadPins: QuadPin[]
  placeMode: string | null
  frameOn: boolean
  frameWidth: number
  frameColor: string
}

// Mutators exposed by useCalculator and consumed by deriveView.
export interface Actions {
  reshuffle: () => void
  updateEl: (i: number, field: 'name' | 'quantity' | 'variations' | 'color', value: string) => void
  removeEl: (i: number) => void
  addEl: () => void
  reorder: (from: number | null, to: number | null) => void
  setArea: (field: 'areaW' | 'areaH', val: string | number) => void
  setTile: (field: 'tileW' | 'tileH', val: string | number) => void
  toggleSlice: () => void
  setAlign: (field: 'alignX' | 'alignY', val: string) => void
  setMode: (val: string) => void
  toggleLabels: () => void
  toggleSeam: () => void
  toggleColUnique: () => void
  toggleRowUnique: () => void
  toggleDisperse: () => void
  setDispStrength: (val: string | number) => void
  setFp: (field: 'fpA' | 'fpB', val: string) => void
  addForbidden: () => void
  removeForbidden: (i: number) => void
  toggleQuad: (name: string) => void
  setQuadBlockStart: (name: string, idx: number, deg: number) => void
  setPlaceMode: (name: string) => void
  pinAt: (r: number, c: number) => void
  clearPins: (name: string) => void
  toggleFrame: () => void
  setFrameWidth: (val: string | number) => void
  setFrameColor: (val: string) => void
  setImg: (i: number, file: File | null | undefined) => void
  clearImg: (i: number) => void
  toggleSudoku: () => void
  toggleEven: () => void
  dragIndex: MutableRefObject<number | null>
}
