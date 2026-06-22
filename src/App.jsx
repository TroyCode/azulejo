import { useEffect, useRef, useState } from 'react'
import { css } from './css.js'
import { dims, textColor, solve } from './solver.js'

// Prefix bundled tile art with Vite's base URL so it resolves under the
// GitHub Pages project path in production and at "/" during local dev.
const tile = (name) => `${import.meta.env.BASE_URL}tiles/${name}`

const INITIAL = {
  areaW: 200,
  areaH: 160,
  tileW: 20,
  tileH: 20,
  slice: true,
  alignX: 'right',
  alignY: 'bottom',
  displayMode: 'image',
  showLabels: true,
  seam: true,
  sudoku: true,
  colUnique: false,
  rowUnique: false,
  disperse: false,
  disperseStrength: 3,
  forbiddenPairs: [],
  fpA: null,
  fpB: null,
  even: true,
  elements: [
    { name: 'A', quantity: 13, variations: 1, color: '#2d4b8e', img: tile('tile_A.png') },
    { name: 'B', quantity: 4, variations: 4, color: '#c1542d', img: tile('tile_B.png') },
    { name: 'C', quantity: 10, variations: 4, color: '#e0a72e', img: tile('tile_C.png') },
    { name: 'D', quantity: 8, variations: 1, color: '#5d8a5a', img: tile('tile_D.png') },
    { name: 'E', quantity: 3, variations: 4, color: '#2f8a8c', img: tile('tile_E.png') },
    { name: 'F', quantity: 13, variations: 4, color: '#a23b2c', img: tile('tile_F.png') },
    { name: 'G', quantity: 8, variations: 1, color: '#b07d2e', img: tile('tile_G.png') },
    { name: 'H', quantity: 5, variations: 1, color: '#834a72', img: tile('tile_H.png') },
    { name: 'I', quantity: 7, variations: 1, color: '#4a6fa5', img: tile('tile_I.png') },
    { name: 'J', quantity: 8, variations: 4, color: '#7d8a3a', img: tile('tile_J.png') },
    { name: 'K', quantity: 15, variations: 2, color: '#b5446a', img: tile('tile_K.png') },
    { name: 'L', quantity: 8, variations: 2, color: '#356a4f', img: tile('tile_L.png') },
  ],
  grid: null,
  vmap: null,
  warning: null,
  combos: null,
  stale: false,
  quadEls: [],
  quadStart: {},
  quadPins: [],
  placeMode: null,
  frameOn: false,
  frameWidth: 1,
  frameColor: '#e7d9b6',
}

const PALETTE = ['#2d4b8e', '#c1542d', '#e0a72e', '#5d8a5a', '#2f8a8c', '#a23b2c', '#b07d2e', '#834a72', '#4a6fa5', '#7d8a3a', '#b5446a', '#356a4f', '#8a5a2b', '#5a5fa0', '#3f7fa0', '#94303f']

export default function App() {
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

  const v = renderVals()
  return (
    <div style={css('min-height:100vh; background:#e9dfca; padding:28px 28px 60px; font-family:\'Karla\',sans-serif; color:#34291b;')}>
      <div style={css('max-width:1180px; margin:0 auto;')}>

        {/* Header */}
        <div style={css('display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap; padding-bottom:18px; border-bottom:2px solid #c9b48d; margin-bottom:24px;')}>
          <div style={css('display:flex; align-items:center; gap:18px;')}>
            <div style={css('width:54px; height:54px; flex:none; border-radius:8px; background:#27408a; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:3px; padding:6px; box-shadow:0 2px 0 #1b2c63;')}>
              <div style={css('background:#e0a72e; border-radius:2px;')}></div>
              <div style={css('background:#f4ecdb; border-radius:2px;')}></div>
              <div style={css('background:#f4ecdb; border-radius:2px;')}></div>
              <div style={css('background:#c1542d; border-radius:2px;')}></div>
            </div>
            <div>
              <div style={css('font-family:\'DM Serif Display\',serif; font-size:32px; line-height:1; color:#27408a; letter-spacing:0.2px;')}>花磚排列計算器</div>
              <div style={css('font-size:14px; color:#7c6c4f; margin-top:6px; font-weight:500;')}>Azulejo — 自動排出每個 3×3 視窗不重複的花磚佈局</div>
            </div>
          </div>
          <button onClick={reshuffle} style={css('border:none; cursor:pointer; background:#c1542d; color:#fff7ec; font-family:\'Karla\',sans-serif; font-weight:800; font-size:15px; padding:13px 22px; border-radius:8px; box-shadow:0 3px 0 #8f3a1d; letter-spacing:0.3px;')}>↻　重新隨機排列</button>
        </div>

        {/* Body: two columns */}
        <div style={css('display:grid; grid-template-columns:374px 1fr; gap:26px; align-items:start;')}>

          {/* ============ LEFT: CONTROLS ============ */}
          <div style={css('display:flex; flex-direction:column; gap:18px;')}>

            {/* Size: area + tile */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a; margin-bottom:14px;')}>鋪設面積與磁磚尺寸</div>

              <div style={css('font-size:12px; font-weight:700; color:#8a7a5b; letter-spacing:0.5px; margin-bottom:6px;')}>鋪設面積 (cm)</div>
              <div style={css('display:flex; align-items:center; gap:10px; margin-bottom:16px;')}>
                <input type="number" value={v.areaW} onChange={v.onAreaW} style={css('flex:1; min-width:0; height:38px; text-align:center; border:1.5px solid #d9c8a4; border-radius:8px; font-family:\'Karla\',sans-serif; font-size:17px; font-weight:700; color:#34291b; background:#fff;')} />
                <span style={css('font-family:\'DM Serif Display\',serif; color:#c9b48d; font-size:20px;')}>×</span>
                <input type="number" value={v.areaH} onChange={v.onAreaH} style={css('flex:1; min-width:0; height:38px; text-align:center; border:1.5px solid #d9c8a4; border-radius:8px; font-family:\'Karla\',sans-serif; font-size:17px; font-weight:700; color:#34291b; background:#fff;')} />
                <span style={css('font-size:12px; font-weight:700; color:#a8997a; white-space:nowrap;')}>寬 × 高</span>
              </div>

              <div style={css('font-size:12px; font-weight:700; color:#8a7a5b; letter-spacing:0.5px; margin-bottom:6px;')}>單片磁磚尺寸 (cm)</div>
              <div style={css('display:flex; align-items:center; gap:10px;')}>
                <input type="number" value={v.tileW} onChange={v.onTileW} style={css('flex:1; min-width:0; height:38px; text-align:center; border:1.5px solid #d9c8a4; border-radius:8px; font-family:\'Karla\',sans-serif; font-size:17px; font-weight:700; color:#34291b; background:#fff;')} />
                <span style={css('font-family:\'DM Serif Display\',serif; color:#c9b48d; font-size:20px;')}>×</span>
                <input type="number" value={v.tileH} onChange={v.onTileH} style={css('flex:1; min-width:0; height:38px; text-align:center; border:1.5px solid #d9c8a4; border-radius:8px; font-family:\'Karla\',sans-serif; font-size:17px; font-weight:700; color:#34291b; background:#fff;')} />
                <span style={css('font-size:12px; font-weight:700; color:#a8997a; white-space:nowrap;')}>寬 × 高</span>
              </div>

              <div style={css('margin-top:16px; padding:11px 14px; background:#eef1f8; border:1.5px solid #c6d0e8; border-radius:9px; display:flex; align-items:center; justify-content:space-between; gap:10px;')}>
                <span style={css('font-size:12px; font-weight:700; color:#5a6b96; letter-spacing:0.3px;')}>計算磁磚數</span>
                <span style={css('font-family:\'DM Serif Display\',serif; font-size:20px; color:#27408a;')}>{v.rows} 列 × {v.cols} 欄</span>
              </div>
              <div onClick={v.toggleSlice} style={css('margin-top:14px; display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer;')}>
                <div>
                  <div style={css('font-size:15px; font-weight:700;')}>邊緣切片補滿</div>
                  <div style={css('font-size:12px; color:#9a8a6b; margin-top:2px;')}>不足一片處補上裁切磁磚(斜紋標示)</div>
                </div>
                <div style={css(`width:46px; height:26px; flex:none; border-radius:14px; background:${v.sliceTrack}; position:relative; transition:background .15s;`)}>
                  <div style={css(`position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.3); transform:${v.sliceKnob}; transition:transform .15s;`)}></div>
                </div>
              </div>
              {v.showAlign && (
                <div style={css('margin-top:13px; display:flex; flex-direction:column; gap:9px;')}>
                  {v.sliceXActive && (
                    <div style={css('display:flex; align-items:center; gap:10px;')}>
                      <span style={css('font-size:12px; font-weight:700; color:#8a7a5b; width:40px; flex:none;')}>水平</span>
                      <div style={css('display:flex; gap:3px; background:#efe7d6; border-radius:8px; padding:3px; flex:1;')}>
                        {v.alignXOpts.map((o, i) => (
                          <div key={i} onClick={o.onClick} style={css(`flex:1; text-align:center; cursor:pointer; font-size:13px; font-weight:700; padding:6px 4px; border-radius:6px; background:${o.bg}; color:${o.fg}; box-shadow:${o.shadow}; transition:background .12s;`)}>{o.label}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {v.sliceYActive && (
                    <div style={css('display:flex; align-items:center; gap:10px;')}>
                      <span style={css('font-size:12px; font-weight:700; color:#8a7a5b; width:40px; flex:none;')}>垂直</span>
                      <div style={css('display:flex; gap:3px; background:#efe7d6; border-radius:8px; padding:3px; flex:1;')}>
                        {v.alignYOpts.map((o, i) => (
                          <div key={i} onClick={o.onClick} style={css(`flex:1; text-align:center; cursor:pointer; font-size:13px; font-weight:700; padding:6px 4px; border-radius:6px; background:${o.bg}; color:${o.fg}; box-shadow:${o.shadow}; transition:background .12s;`)}>{o.label}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {v.remainderNote && (
                <div style={css('font-size:11.5px; color:#9a8a6b; margin-top:8px; line-height:1.5;')}>{v.remainderNote}</div>
              )}
            </div>

            {/* Rules */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a; margin-bottom:14px;')}>排列規則</div>

              <Toggle onClick={v.toggleSudoku} title="九宮格不重複" desc="任一 3×3 視窗內 9 格皆相異(類數獨)" track={v.sudokuTrack} knob={v.sudokuKnob} />
              <Divider />
              <Toggle onClick={v.toggleEven} title="平均使用元素" desc="關閉時改為「由上而下依優先序多用」" track={v.evenTrack} knob={v.evenKnob} />
              <Divider />
              <Toggle onClick={v.toggleCol} title="直排不重複" desc="每一直行內元素皆相異" track={v.colTrack} knob={v.colKnob} />
              <Divider />
              <Toggle onClick={v.toggleRow} title="橫排不重複" desc="每一橫列內元素皆相異" track={v.rowTrack} knob={v.rowKnob} />
              <Divider />
              <Toggle onClick={v.toggleDisperse} title="最大化分散度" desc="模擬退火優化,拉開同種元素間距" track={v.dispTrack} knob={v.dispKnob} />
              {v.disperse && (
                <div style={css('padding:4px 2px 6px;')}>
                  <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;')}>
                    <span style={css('font-size:12px; font-weight:700; color:#8a7a5b;')}>優化強度</span>
                    <span style={css('font-size:12px; font-weight:800; color:#27408a;')}>{v.dispStrengthLabel}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" value={v.disperseStrength} onChange={v.onDispStrength} style={css('width:100%; accent-color:#27408a; cursor:pointer;')} />
                </div>
              )}
            </div>

            {/* Frame */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div onClick={v.toggleFrame} style={css('display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer;')}>
                <div>
                  <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a;')}>四周畫框</div>
                  <div style={css('font-size:12px; color:#9a8a6b; margin-top:2px;')}>外圈不鋪磁磚,留單色邊框</div>
                </div>
                <div style={css(`width:46px; height:26px; flex:none; border-radius:14px; background:${v.frameTrack}; position:relative; transition:background .15s;`)}>
                  <div style={css(`position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.3); transform:${v.frameKnob}; transition:transform .15s;`)}></div>
                </div>
              </div>
              {v.frameOn && (
                <div style={css('display:flex; align-items:center; gap:16px; margin-top:14px;')}>
                  <div style={css('display:flex; align-items:center; gap:8px;')}>
                    <span style={css('font-size:12px; font-weight:700; color:#8a7a5b;')}>厚度</span>
                    <button onClick={v.decFrame} style={css('width:30px; height:32px; border:1.5px solid #d9c8a4; background:#f4ecdb; border-radius:7px; font-size:18px; font-weight:700; color:#7c6c4f; cursor:pointer;')}>−</button>
                    <span style={css('min-width:42px; text-align:center; font-size:14px; font-weight:800; color:#34291b;')}>{v.frameWidthLabel}</span>
                    <button onClick={v.incFrame} style={css('width:30px; height:32px; border:1.5px solid #d9c8a4; background:#f4ecdb; border-radius:7px; font-size:18px; font-weight:700; color:#7c6c4f; cursor:pointer;')}>+</button>
                  </div>
                  <div style={css('display:flex; align-items:center; gap:8px;')}>
                    <span style={css('font-size:12px; font-weight:700; color:#8a7a5b;')}>顏色</span>
                    <input type="color" value={v.frameColor} onChange={v.onFrameColor} style={css('width:34px; height:32px;')} />
                  </div>
                </div>
              )}
            </div>

            {/* Adjacency restrictions */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a; margin-bottom:4px;')}>相鄰限制</div>
              <div style={css('font-size:12px; color:#9a8a6b; margin-bottom:12px;')}>指定兩種元素不可上下或左右相鄰</div>

              {v.hasForbidden && (
                <div style={css('display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;')}>
                  {v.forbiddenView.map((f, i) => (
                    <div key={i} style={css('display:flex; align-items:center; gap:7px; background:#fbe5dc; border:1.5px solid #e0a98e; border-radius:8px; padding:5px 6px 5px 10px;')}>
                      <span style={css(`display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:5px; background:${f.colorA}; color:${f.fgA}; font-weight:800; font-size:11px;`)}>{f.a}</span>
                      <span style={css('font-size:13px; font-weight:800; color:#a8432a;')}>⊘</span>
                      <span style={css(`display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:5px; background:${f.colorB}; color:${f.fgB}; font-weight:800; font-size:11px;`)}>{f.b}</span>
                      <div onClick={f.onRemove} style={css('cursor:pointer; color:#c2755c; font-size:16px; line-height:1; padding:0 2px;')}>×</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={css('display:flex; align-items:center; gap:7px;')}>
                <select value={v.fpA} onChange={v.onFpA} style={css('flex:1; height:36px; border:1.5px solid #d9c8a4; border-radius:7px; padding:0 8px; font-family:\'Karla\',sans-serif; font-size:14px; font-weight:700; color:#34291b; background:#fff; cursor:pointer;')}>
                  {v.elNames.map((n, i) => (<option key={i} value={n}>{n}</option>))}
                </select>
                <span style={css('font-size:13px; font-weight:800; color:#a8432a; flex:none;')}>⊘</span>
                <select value={v.fpB} onChange={v.onFpB} style={css('flex:1; height:36px; border:1.5px solid #d9c8a4; border-radius:7px; padding:0 8px; font-family:\'Karla\',sans-serif; font-size:14px; font-weight:700; color:#34291b; background:#fff; cursor:pointer;')}>
                  {v.elNames.map((n, i) => (<option key={i} value={n}>{n}</option>))}
                </select>
                <button onClick={v.addForbidden} style={css('flex:none; height:36px; padding:0 14px; border:none; cursor:pointer; background:#27408a; color:#fff7ec; font-family:\'Karla\',sans-serif; font-weight:800; font-size:14px; border-radius:7px;')}>新增</button>
              </div>
            </div>

            {/* 2x2 rotation groups */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a; margin-bottom:4px;')}>2×2 旋轉組</div>
              <div style={css('font-size:12px; color:#9a8a6b; margin-bottom:12px;')}>選定元素以「四種旋轉拼成 2×2 一組」整組出現(需 4 種變化、數量為 4 的倍數)</div>
              {v.hasQuadOpts && (
                <div style={css('display:flex; flex-direction:column; gap:8px;')}>
                  {v.quadOptions.map((q, i) => (
                    <div key={i} style={css('display:flex; align-items:flex-start; gap:9px; flex-wrap:wrap;')}>
                      <div onClick={q.onToggle} style={css(`display:flex; align-items:center; gap:7px; cursor:pointer; border:1.5px solid ${q.border}; background:${q.bg}; border-radius:8px; padding:6px 11px 6px 7px;`)}>
                        <span style={css(`display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:5px; background:${q.color}; color:${q.fg}; font-weight:800; font-size:12px;`)}>{q.name}</span>
                        <span style={css(`font-size:13px; font-weight:700; color:${q.textColor};`)}>{q.label}</span>
                      </div>
                      {q.on && (
                        <>
                          <div style={css('display:flex; flex-direction:column; gap:5px;')}>
                            {q.blocks.map((blk, bi) => (
                              <div key={bi} style={css('display:flex; align-items:center; gap:6px;')}>
                                <span style={css('font-size:11px; font-weight:700; color:#a8997a; width:30px; flex:none;')}>{blk.label}</span>
                                <div style={css('display:flex; gap:2px; background:#efe7d6; border-radius:7px; padding:2px;')}>
                                  {blk.angles.map((ang, ai) => (
                                    <div key={ai} onClick={ang.onClick} style={css(`cursor:pointer; font-size:12px; font-weight:700; padding:4px 9px; border-radius:5px; background:${ang.bg}; color:${ang.fg}; box-shadow:${ang.shadow};`)}>{ang.label}</div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={css('display:flex; align-items:center; gap:7px; margin-top:7px;')}>
                            <div onClick={q.onPlace} style={css(`cursor:pointer; display:flex; align-items:center; gap:5px; font-size:12px; font-weight:800; padding:5px 11px; border-radius:7px; background:${q.placeBg}; color:${q.placeFg}; border:1.5px solid ${q.placeBorder};`)}>{q.placeLabel}</div>
                            {q.hasPins && (
                              <>
                                <span style={css('font-size:11px; font-weight:700; color:#7c6c4f;')}>已釘 {q.pinCount}</span>
                                <div onClick={q.onClearPins} style={css('cursor:pointer; font-size:11px; font-weight:700; color:#c2755c; text-decoration:underline;')}>清除</div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {v.noQuadOpts && (
                <div style={css('font-size:13px; color:#b3a589; font-style:italic;')}>尚無符合條件的元素(需設為 4 種變化)。</div>
              )}
            </div>

            {/* Elements */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div style={css('display:flex; align-items:baseline; justify-content:space-between; margin-bottom:4px;')}>
                <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a;')}>元素</div>
                <div style={css('font-size:12px; color:#9a8a6b;')}>拖曳 ⠿ 調整優先順序(上＝優先)</div>
              </div>

              <div style={css('display:grid; grid-template-columns:16px 28px 30px 1fr 44px 38px 16px; gap:6px; align-items:center; padding:8px 2px 6px; font-size:11px; font-weight:700; color:#a8997a; letter-spacing:0.3px;')}>
                <div></div><div>色</div><div>圖</div><div>名稱</div><div style={css('text-align:center;')}>數量</div><div style={css('text-align:center;')}>變化</div><div></div>
              </div>

              <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                {v.elementsView.map((el, i) => (
                  <div key={i} draggable onDragStart={el.onDragStart} onDragOver={el.onDragOver} onDrop={el.onDrop} style={css('display:grid; grid-template-columns:16px 28px 30px 1fr 44px 38px 16px; gap:6px; align-items:center; background:#fff; border:1.5px solid #e6d8ba; border-radius:8px; padding:6px 8px;')}>
                    <div style={css('cursor:grab; color:#c4b48f; font-size:15px; text-align:center; line-height:1; user-select:none;')}>⠿</div>
                    <input type="color" value={el.color} onChange={el.onColor} style={css('width:28px; height:30px;')} />
                    <label style={css('position:relative; width:30px; height:30px; border-radius:6px; cursor:pointer; overflow:hidden; border:1px solid #e6d8ba; display:flex; align-items:center; justify-content:center; background:#f4ecdb;')}>
                      <input type="file" accept="image/*" onChange={el.onImg} style={css('position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer;')} />
                      {el.hasImg && el.imgEl}
                      {el.noImg && (<span style={css('font-size:15px; color:#b3a07c; font-weight:700; pointer-events:none;')}>＋</span>)}
                    </label>
                    <input type="text" value={el.name} onChange={el.onName} style={css('width:100%; height:32px; border:1px solid #e6d8ba; border-radius:6px; padding:0 8px; font-family:\'Karla\',sans-serif; font-size:15px; font-weight:700; color:#34291b;')} />
                    <input type="number" value={el.quantity} onChange={el.onQty} style={css('width:100%; height:32px; text-align:center; border:1px solid #e6d8ba; border-radius:6px; font-family:\'Karla\',sans-serif; font-size:14px; font-weight:600; color:#34291b;')} />
                    <input type="number" value={el.variations} onChange={el.onVar} style={css('width:100%; height:32px; text-align:center; border:1px solid #e6d8ba; border-radius:6px; font-family:\'Karla\',sans-serif; font-size:14px; font-weight:600; color:#34291b;')} />
                    <div onClick={el.onRemove} style={css('cursor:pointer; color:#cbb48f; font-size:17px; text-align:center; line-height:1;')}>×</div>
                  </div>
                ))}
              </div>

              <button onClick={v.addEl} style={css('width:100%; margin-top:12px; border:1.5px dashed #cbb98f; background:transparent; color:#8a7a5b; font-family:\'Karla\',sans-serif; font-weight:700; font-size:14px; padding:10px; border-radius:8px; cursor:pointer;')}>＋ 新增元素</button>
            </div>

            <button onClick={reshuffle} style={css('border:none; cursor:pointer; background:#27408a; color:#fff7ec; font-family:\'Karla\',sans-serif; font-weight:800; font-size:16px; padding:15px; border-radius:10px; box-shadow:0 3px 0 #1b2c63; letter-spacing:0.5px;')}>重新排列</button>
          </div>

          {/* ============ RIGHT: RESULT ============ */}
          <div style={css('display:flex; flex-direction:column; gap:18px;')}>

            {/* Summary bar */}
            <div style={css('display:flex; flex-wrap:wrap; gap:10px;')}>
              <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
                <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#27408a;')}>{v.rows}×{v.cols}</span>
                <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>＝ {v.totalCells} 格</span>
              </div>
              <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
                <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#5d8a5a;')}>{v.filledCount}</span>
                <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>已填</span>
                <span style={css('font-size:12px; color:#c0ad88;')}>/ 留白 {v.emptyCount}</span>
              </div>
              <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
                <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#c1542d;')}>{v.totalQty}</span>
                <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>可用磁磚總數</span>
              </div>
              <div title={v.combosTitle} style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
                <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#27408a;')}>{v.combosLabel}</span>
                <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>種排列組合</span>
              </div>
              <div title="同種元素之間的平均曼哈頓距離(水平/垂直移動一格＝1),數字越大代表分布越分散" style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
                <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#5d8a5a;')}>{v.avgDistLabel}</span>
                <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>平均間距</span>
              </div>
            </div>

            {/* Banners */}
            {v.placeModeOn && (
              <div style={css('background:#e6eefb; border:1.5px solid #97b3e6; border-radius:10px; padding:11px 16px; font-size:13.5px; font-weight:700; color:#27408a; display:flex; align-items:center; gap:8px;')}>⊞　放置「{v.placeModeName}」醫章 — 點內圈格子設為 2×2 左上角(再點一次取消),完成後按〔重新排列〕。</div>
            )}
            {v.stale && (
              <div style={css('background:#fdf3dc; border:1.5px solid #e7c873; border-radius:10px; padding:11px 16px; font-size:13.5px; font-weight:600; color:#9a7012; display:flex; align-items:center; gap:8px;')}>⚠　設定已變更 — 按〔重新排列〕套用新結果。</div>
            )}
            {v.hasWarning && (
              <div style={css('background:#fbe5dc; border:1.5px solid #e09a7e; border-radius:10px; padding:11px 16px; font-size:13.5px; font-weight:600; color:#a8432a; display:flex; align-items:center; gap:8px;')}>●　{v.warning}</div>
            )}

            {/* Display mode + Grid */}
            <div style={css('display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;')}>
              <div style={css('display:flex; align-items:center; gap:10px;')}>
                <span style={css('font-size:13px; font-weight:700; color:#8a7a5b;')}>顯示方式</span>
                <div style={css('display:flex; gap:3px; background:#efe7d6; border-radius:8px; padding:3px;')}>
                  {v.modeOpts.map((o, i) => (
                    <div key={i} onClick={o.onClick} style={css(`cursor:pointer; font-size:13px; font-weight:700; padding:6px 16px; border-radius:6px; background:${o.bg}; color:${o.fg}; box-shadow:${o.shadow}; transition:background .12s;`)}>{o.label}</div>
                  ))}
                </div>
              </div>
              {v.showLabelToggle && (
                <div onClick={v.toggleLabels} style={css('display:flex; align-items:center; gap:8px; cursor:pointer;')}>
                  <span style={css('font-size:13px; font-weight:700; color:#8a7a5b;')}>顯示代號</span>
                  <div style={css(`width:42px; height:24px; flex:none; border-radius:13px; background:${v.labelTrack}; position:relative; transition:background .15s;`)}>
                    <div style={css(`position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.3); transform:${v.labelKnob}; transition:transform .15s;`)}></div>
                  </div>
                </div>
              )}
              <div onClick={v.toggleSeam} style={css('display:flex; align-items:center; gap:8px; cursor:pointer;')}>
                <span style={css('font-size:13px; font-weight:700; color:#8a7a5b;')}>{v.seamLabel}</span>
                <div style={css(`width:42px; height:24px; flex:none; border-radius:13px; background:${v.seamTrack}; position:relative; transition:background .15s;`)}>
                  <div style={css(`position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.3); transform:${v.seamKnob}; transition:transform .15s;`)}></div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:22px;')}>
              <div style={css('width:max-content; max-width:100%; margin:0 auto;')}>
                <div style={css(`display:grid; grid-template-columns:${v.gridCols}; grid-template-rows:${v.gridRows}; gap:${v.gridGap}; background:${v.gridBg}; padding:${v.gridPad}; border-radius:6px;`)}>
                  {v.cells.map((cell, i) => (
                    <div key={i} onClick={cell.onCellClick || undefined} style={css(`position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; cursor:${cell.cellCursor}; background:${cell.bg}; color:${cell.fg}; border-radius:${cell.radius}; box-shadow:${cell.shadow}; font-family:'Karla',sans-serif; font-weight:800; line-height:1; font-size:${cell.fontSize};`)}>
                      {cell.hasImg && cell.imgEl}
                      {cell.showLetter && (<span>{cell.letter}</span>)}
                      {cell.showVar && (<span style={css(`position:absolute; right:3px; bottom:2px; font-weight:700; opacity:.78; font-size:${cell.varFontSize};`)}>{cell.variation}</span>)}
                      {cell.showChip && (<span style={css('position:absolute; left:3px; top:3px; background:rgba(20,16,8,.55); color:#fff; font-weight:800; font-size:10px; line-height:1; padding:2px 4px; border-radius:4px;')}>{cell.chipText}</span>)}
                      {cell.showSliceMark && (<div style={css('position:absolute; inset:0; pointer-events:none; box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.85); border-radius:3px; -webkit-mask:repeating-linear-gradient(45deg, #000 0 4px, transparent 4px 8px); mask:repeating-linear-gradient(45deg, #000 0 4px, transparent 4px 8px);')}></div>)}
                      {cell.placeable && (<div style={css('position:absolute; inset:1px; pointer-events:none; border:1.5px dashed rgba(39,64,138,.5); border-radius:3px;')}></div>)}
                      {cell.showPin && (<div style={css(`position:absolute; left:2px; top:2px; width:13px; height:13px; pointer-events:none; border-radius:50%; background:${cell.pinColor}; box-shadow:0 0 0 2px #fff, 0 1px 2px rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; color:${cell.pinFg}; font-size:8px; font-weight:800;`)}>⊞</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
              <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a; margin-bottom:14px;')}>使用統計</div>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fill, minmax(168px,1fr)); gap:10px;')}>
                {v.statsView.map((s, i) => (
                  <div key={i} style={css('border:1.5px solid #e6d8ba; border-radius:9px; padding:10px 12px; background:#fff;')}>
                    <div style={css('display:flex; align-items:center; gap:8px;')}>
                      <div style={css(`width:22px; height:22px; flex:none; border-radius:5px; background:${s.color}; color:${s.fg}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;`)}>{s.name}</div>
                      <div style={css('font-size:15px; font-weight:800; color:#34291b;')}>{s.usedLabel}</div>
                      {s.full && (<div style={css('margin-left:auto; font-size:10px; font-weight:800; color:#5d8a5a; background:#e8f0e3; padding:2px 6px; border-radius:5px;')}>滿</div>)}
                    </div>
                    {s.hasVar && (
                      <div style={css('display:flex; flex-wrap:wrap; gap:5px; margin-top:8px;')}>
                        {s.breakdown.map((b, bi) => (
                          <div key={bi} style={css('font-size:11px; font-weight:700; color:#7c6c4f; background:#f4ecdb; border-radius:5px; padding:2px 7px;')}>{b.label}<span style={css('color:#b3a07c;')}>·</span>{b.count}</div>
                        ))}
                      </div>
                    )}
                    {s.hasDist && (
                      <div style={css('display:flex; gap:12px; margin-top:9px; padding-top:8px; border-top:1px solid #f0e7d3;')}>
                        <div style={css('display:flex; align-items:baseline; gap:4px;')}>
                          <span style={css('font-size:14px; font-weight:800; color:#5d8a5a;')}>{s.avgDistLabel}</span>
                          <span style={css('font-size:10px; font-weight:700; color:#a8997a;')}>平均間距</span>
                        </div>
                        <div style={css('display:flex; align-items:baseline; gap:4px;')}>
                          <span style={css('font-size:14px; font-weight:800; color:#c1542d;')}>{s.minDistLabel}</span>
                          <span style={css('font-size:10px; font-weight:700; color:#a8997a;')}>最近</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )

  // ---- derive all view values from current state (ported from renderVals) ----
  function renderVals() {
    const { areaW, areaH, tileW, tileH, slice, alignX, alignY, displayMode, showLabels, seam, combos, sudoku, even, elements, grid, vmap, warning, stale, frameOn, frameWidth, frameColor } = state
    const D = dims(state)
    const { rows: R, cols: C, colW, colSlice, rowH, rowSlice, remW, remH, sliceX, sliceY, tw, th } = D
    const totalCells = R * C
    const caps = elements.map((e) => Math.max(0, Math.floor(Number(e.quantity)) || 0))
    const totalQty = caps.reduce((a, b) => a + b, 0)

    // grid geometry — physical px scale so slice tiles render proportionally
    const coveredW = colW.reduce((a, b) => a + b, 0) || tw
    const coveredH = rowH.reduce((a, b) => a + b, 0) || th
    const pxPerCm = Math.min(580 / coveredW, 520 / coveredH, 58 / Math.max(tw, th))
    const colTracks = colW.map((w) => (w * pxPerCm).toFixed(2) + 'px')
    const rowTracks = rowH.map((h) => (h * pxPerCm).toFixed(2) + 'px')
    const base = Math.min(tw, th) * pxPerCm
    const fwPx = tw * pxPerCm, fhPx = th * pxPerCm // full-tile px — slice cells crop this, never scale it
    const fontPx = Math.max(11, Math.round(base * 0.42)) + 'px'
    const varPx = Math.max(8, Math.round(base * 0.26)) + 'px'
    const cellRadius = seam ? '3px' : '0px'

    // derive variations + counts from grid
    const used = elements.map(() => 0)
    const varCount = elements.map(() => ({}))
    const positions = elements.map(() => [])
    const cells = []
    const fwR = frameOn ? Math.max(0, Math.min(Math.floor(Math.min(R, C) / 2), Math.floor(Number(frameWidth)) || 0)) : 0
    const isFrameCell = (cr, cc) => fwR > 0 && (cr < fwR || cr >= R - fwR || cc < fwR || cc >= C - fwR)
    const frameCellObj = () => ({ letter: '', variation: '', showVar: false, showLetter: false, hasImg: false, img: '', imgEl: null, imgTransform: 'none', showChip: false, chipText: '', isSlice: false, showSliceMark: false, radius: cellRadius, shadow: 'none', bg: frameColor, fg: '#fff', fontSize: fontPx, varFontSize: varPx })
    if (grid && grid.length === totalCells) {
      const occ = elements.map(() => 0)
      for (let pos = 0; pos < totalCells; pos++) {
        const cr = (pos / C) | 0, cc = pos % C
        if (isFrameCell(cr, cc)) { cells.push(frameCellObj()); continue }
        const isSlice = !!(colSlice[cc] || rowSlice[cr])
        const e = grid[pos]
        if (e == null || e < 0 || e >= elements.length) {
          cells.push({ letter: '', variation: '', showVar: false, showLetter: false, hasImg: false, img: '', showChip: false, chipText: '', isSlice, showSliceMark: isSlice && displayMode !== 'image', bg: '#efe7d6', fg: '#cbbd9e', fontSize: fontPx, varFontSize: varPx })
          continue
        }
        const el = elements[e]
        const vc = Math.max(1, Math.floor(Number(el.variations)) || 1)
        const vOverride = (vmap && vmap[pos] > 0) ? vmap[pos] : 0
        const vv = vOverride || ((occ[e] % vc) + 1); if (!vOverride) occ[e]++
        used[e]++
        positions[e].push([cr, cc])
        if (vc > 1) varCount[e][vv] = (varCount[e][vv] || 0) + 1
        const hasImg = displayMode === 'image' && !!el.img
        const rot = (vv - 1) * 90 // variation = 90° rotation
        // anchor full-size tile to the UNCUT edges so slice cells crop (never squash)
        const leadingCol = !!colSlice[cc] && cc === 0
        const leadingRow = !!rowSlice[cr] && cr === 0
        const imgStyle = {
          position: 'absolute', width: fwPx + 'px', height: fhPx + 'px',
          maxWidth: 'none', maxHeight: 'none', objectFit: 'cover', display: 'block',
          transform: 'rotate(' + rot + 'deg)',
        }
        if (leadingCol) { imgStyle.right = '0' } else { imgStyle.left = '0' }
        if (leadingRow) { imgStyle.bottom = '0' } else { imgStyle.top = '0' }
        cells.push({
          letter: el.name, variation: vv, showVar: vc > 1 && !hasImg, showLetter: !hasImg,
          hasImg, img: hasImg ? el.img : '', imgTransform: 'rotate(' + rot + 'deg)',
          imgEl: hasImg ? <img src={el.img} alt="" style={imgStyle} /> : null,
          radius: cellRadius, shadow: seam ? ('inset 0 0 0 1.5px rgba(255,255,255,.22), inset 0 0 0 3px ' + el.color) : 'none',
          showChip: hasImg && showLabels, chipText: el.name + (vc > 1 ? ('·' + vv) : ''),
          isSlice, bg: el.color, fg: textColor(el.color), fontSize: fontPx, varFontSize: varPx,
          showSliceMark: isSlice && displayMode !== 'image',
        })
      }
    } else {
      for (let i = 0; i < totalCells; i++) { const cr = (i / C) | 0, cc = i % C; if (isFrameCell(cr, cc)) { cells.push(frameCellObj()); continue } cells.push({ letter: '', variation: '', showVar: false, showLetter: false, hasImg: false, img: '', imgTransform: 'none', imgEl: null, radius: cellRadius, shadow: seam ? 'inset 0 0 0 1.5px rgba(255,255,255,.22)' : 'none', showChip: false, chipText: '', isSlice: false, bg: '#efe7d6', fg: '#cbbd9e', fontSize: fontPx, varFontSize: varPx }) }
    }

    const filledCount = used.reduce((a, b) => a + b, 0)
    const frameCellCount = fwR > 0 ? (totalCells - Math.max(0, R - 2 * fwR) * Math.max(0, C - 2 * fwR)) : 0
    const tileableCells = totalCells - frameCellCount
    const emptyCount = grid ? (tileableCells - filledCount) : tileableCells

    // ---- 2x2 placement overlay: pin dots + clickable cells when in place mode ----
    const placeMode = state.placeMode
    const pinMap = {} // topleft index -> element color
    for (const pin of (state.quadPins || [])) {
      const el = elements.find((x) => x.name === pin.name)
      if (el) pinMap[pin.r * C + pin.c] = el.color
    }
    for (let pos = 0; pos < cells.length && pos < totalCells; pos++) {
      const cr = (pos / C) | 0, cc = pos % C
      const isInterior = !isFrameCell(cr, cc)
      const validTopLeft = isInterior && (cr + 1 <= R - 1 - fwR) && (cc + 1 <= C - 1 - fwR) && !isFrameCell(cr + 1, cc + 1)
      const co = cells[pos]
      co.onCellClick = (placeMode && validTopLeft) ? (() => pinAt(cr, cc)) : null
      co.cellCursor = placeMode && validTopLeft ? 'pointer' : 'default'
      co.placeable = !!placeMode && validTopLeft && pinMap[pos] == null
      co.showPin = pinMap[pos] != null
      co.pinColor = pinMap[pos] || 'transparent'
      co.pinFg = textColor(pinMap[pos] || '#888')
    }

    // element rows
    const elementsView = elements.map((el, i) => ({
      name: el.name, quantity: el.quantity, variations: el.variations, color: el.color,
      img: el.img || '', hasImg: !!el.img, noImg: !el.img,
      imgEl: el.img ? <img src={el.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} /> : null,
      onImg: (e) => setImg(i, e.target.files && e.target.files[0]),
      onClearImg: (e) => { e.stopPropagation(); clearImg(i) },
      onName: (e) => updateEl(i, 'name', e.target.value),
      onQty: (e) => updateEl(i, 'quantity', e.target.value),
      onVar: (e) => updateEl(i, 'variations', e.target.value),
      onColor: (e) => updateEl(i, 'color', e.target.value),
      onRemove: () => removeEl(i),
      onDragStart: (e) => { dragIndex.current = i; if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move' },
      onDragOver: (e) => { e.preventDefault() },
      onDrop: (e) => { e.preventDefault(); reorder(dragIndex.current, i) },
    }))

    // stats
    let distSum = 0, distPairs = 0
    const statsView = elements.map((el, i) => {
      const cap = caps[i]
      const vc = Math.max(1, Math.floor(Number(el.variations)) || 1)
      const breakdown = []
      if (vc > 1) for (let vv = 1; vv <= vc; vv++) breakdown.push({ label: el.name + vv, count: varCount[i][vv] || 0 })
      // average pairwise Manhattan distance between same-element tiles
      const ps = positions[i]
      let sum = 0, pairs = 0, minD = Infinity
      for (let a = 0; a < ps.length; a++) for (let b = a + 1; b < ps.length; b++) {
        const d = Math.abs(ps[a][0] - ps[b][0]) + Math.abs(ps[a][1] - ps[b][1])
        sum += d; pairs++; if (d < minD) minD = d
      }
      distSum += sum; distPairs += pairs
      const avgD = pairs ? (sum / pairs) : null
      return {
        name: el.name, color: el.color, fg: textColor(el.color),
        usedLabel: (used[i] || 0) + ' / ' + cap,
        full: !!grid && cap > 0 && (used[i] || 0) >= cap,
        hasVar: vc > 1, breakdown,
        hasDist: pairs > 0,
        avgDistLabel: avgD == null ? '—' : avgD.toFixed(2),
        minDistLabel: pairs ? String(minD) : '—',
      }
    })
    const overallAvgDist = distPairs ? (distSum / distPairs) : null

    return {
      rows: R, cols: C,
      totalCells, totalQty, filledCount, emptyCount,
      avgDistLabel: overallAvgDist == null ? '—' : overallAvgDist.toFixed(2),
      combosLabel: !combos ? '—' : (combos.capped ? combos.total.toLocaleString() + '+' : ((combos.timedOut && combos.total === 0) ? '極多' : (combos.timedOut ? '≥ ' + combos.total.toLocaleString() : combos.total.toLocaleString()))),
      combosTitle: !combos ? '尚未計算' : (combos.capped ? '合法排列極多,僅計到上限 ' + combos.total.toLocaleString() : ((combos.timedOut && combos.total === 0) ? '合法排列數量龐大,無法在時限內精確計算' : (combos.timedOut ? '數量龐大,於時限內至少數到 ' + combos.total.toLocaleString() + ' 種' : '在目前規則下的精確合法排列數'))),
      sudokuTrack: sudoku ? '#27408a' : '#d3c4a3', sudokuKnob: sudoku ? 'translateX(20px)' : 'translateX(0)',
      evenTrack: even ? '#27408a' : '#d3c4a3', evenKnob: even ? 'translateX(20px)' : 'translateX(0)',
      colTrack: state.colUnique ? '#27408a' : '#d3c4a3', colKnob: state.colUnique ? 'translateX(20px)' : 'translateX(0)',
      rowTrack: state.rowUnique ? '#27408a' : '#d3c4a3', rowKnob: state.rowUnique ? 'translateX(20px)' : 'translateX(0)',
      toggleCol: () => toggleColUnique(),
      toggleRow: () => toggleRowUnique(),
      disperse: state.disperse, disperseStrength: state.disperseStrength,
      dispTrack: state.disperse ? '#27408a' : '#d3c4a3', dispKnob: state.disperse ? 'translateX(20px)' : 'translateX(0)',
      dispStrengthLabel: ['—', '輕', '中', '較強', '強', '最強'][state.disperseStrength] || '中',
      toggleDisperse: () => toggleDisperse(),
      onDispStrength: (e) => setDispStrength(e.target.value),
      elNames: elements.map((el) => el.name),
      fpA: state.fpA ?? (elements[0] ? elements[0].name : ''),
      fpB: state.fpB ?? (elements[1] ? elements[1].name : (elements[0] ? elements[0].name : '')),
      onFpA: (e) => setFp('fpA', e.target.value),
      onFpB: (e) => setFp('fpB', e.target.value),
      addForbidden: () => addForbidden(),
      hasForbidden: (state.forbiddenPairs || []).length > 0,
      forbiddenView: (state.forbiddenPairs || []).map((p, i) => {
        const ea = elements.find((el) => el.name === p.a), eb = elements.find((el) => el.name === p.b)
        return {
          a: p.a, b: p.b,
          colorA: ea ? ea.color : '#bbb', fgA: textColor(ea ? ea.color : '#bbb'),
          colorB: eb ? eb.color : '#bbb', fgB: textColor(eb ? eb.color : '#bbb'),
          onRemove: () => removeForbidden(i),
        }
      }),
      quadOptions: elements.filter((el) => (Math.max(1, Math.floor(Number(el.variations)) || 1) === 4)).map((el) => {
        const on = (state.quadEls || []).includes(el.name)
        const arr = (state.quadStart || {})[el.name] || []
        const nBlocks = Math.max(0, Math.floor((Math.max(0, Math.floor(Number(el.quantity)) || 0)) / 4))
        const blocks = []
        for (let k = 0; k < nBlocks; k++) {
          const cur = (Math.round((Number(arr[k]) || 0) / 90) * 90) % 360
          blocks.push({
            label: nBlocks > 1 ? ('組' + (k + 1)) : '起始',
            angles: [0, 90, 180, 270].map((d) => ({
              label: d + '°', onClick: () => setQuadBlockStart(el.name, k, d),
              bg: cur === d ? '#27408a' : 'transparent', fg: cur === d ? '#fff7ec' : '#7c6c4f',
              shadow: cur === d ? '0 1px 2px rgba(0,0,0,.18)' : 'none',
            })),
          })
        }
        return {
          name: el.name, label: on ? '2×2 開' : '單片', on,
          color: el.color, fg: textColor(el.color),
          onToggle: () => toggleQuad(el.name),
          bg: on ? '#e6eefb' : '#fff', border: on ? '#27408a' : '#e6d8ba',
          textColor: on ? '#27408a' : '#9a8a6b',
          blocks,
          onPlace: () => setPlaceMode(el.name),
          placeLabel: state.placeMode === el.name ? '✓ 點格子放置中' : '＋ 指定位置',
          placeBg: state.placeMode === el.name ? '#27408a' : '#fff',
          placeFg: state.placeMode === el.name ? '#fff7ec' : '#27408a',
          placeBorder: state.placeMode === el.name ? '#27408a' : '#bcd0f0',
          hasPins: (state.quadPins || []).some((p) => p.name === el.name),
          pinCount: (state.quadPins || []).filter((p) => p.name === el.name).length,
          onClearPins: () => clearPins(el.name),
        }
      }),
      hasQuadOpts: elements.some((el) => (Math.max(1, Math.floor(Number(el.variations)) || 1) === 4)),
      noQuadOpts: !elements.some((el) => (Math.max(1, Math.floor(Number(el.variations)) || 1) === 4)),
      frameOn, frameColor,
      placeModeOn: !!placeMode, placeModeName: placeMode || '',
      frameTrack: frameOn ? '#27408a' : '#d3c4a3', frameKnob: frameOn ? 'translateX(20px)' : 'translateX(0)',
      frameWidthLabel: (frameWidth || 1) + ' 圈',
      toggleFrame: () => toggleFrame(),
      incFrame: () => setFrameWidth((Number(frameWidth) || 1) + 1),
      decFrame: () => setFrameWidth((Number(frameWidth) || 1) - 1),
      onFrameColor: (e) => setFrameColor(e.target.value),
      elementsView, statsView, cells,
      gridCols: colTracks.join(' '), gridRows: rowTracks.join(' '), gridMaxWidth: 'none',
      sliceTrack: slice ? '#27408a' : '#d3c4a3', sliceKnob: slice ? 'translateX(20px)' : 'translateX(0)',
      stale, hasWarning: !!warning, warning: warning || '',
      reshuffle: () => reshuffle(),
      addEl: () => addEl(),
      toggleSlice: () => toggleSlice(),
      toggleSudoku: () => toggleSudoku(),
      toggleEven: () => toggleEven(),
      showAlign: slice && (sliceX || sliceY),
      modeOpts: [
        { val: 'color', label: '色塊' }, { val: 'image', label: '實際圖' },
      ].map((o) => ({ label: o.label, active: displayMode === o.val, bg: displayMode === o.val ? '#27408a' : 'transparent', fg: displayMode === o.val ? '#fff7ec' : '#7c6c4f', shadow: displayMode === o.val ? '0 1px 2px rgba(0,0,0,.2)' : 'none', onClick: () => setMode(o.val) })),
      alignXOpts: [
        { val: 'left', label: '靠左' }, { val: 'right', label: '靠右' }, { val: 'even', label: '平均' },
      ].map((o) => ({ label: o.label, active: alignX === o.val, bg: alignX === o.val ? '#27408a' : 'transparent', fg: alignX === o.val ? '#fff7ec' : '#7c6c4f', shadow: alignX === o.val ? '0 1px 2px rgba(0,0,0,.2)' : 'none', onClick: () => setAlign('alignX', o.val) })),
      alignYOpts: [
        { val: 'top', label: '靠上' }, { val: 'bottom', label: '靠下' }, { val: 'even', label: '平均' },
      ].map((o) => ({ label: o.label, active: alignY === o.val, bg: alignY === o.val ? '#27408a' : 'transparent', fg: alignY === o.val ? '#fff7ec' : '#7c6c4f', shadow: alignY === o.val ? '0 1px 2px rgba(0,0,0,.2)' : 'none', onClick: () => setAlign('alignY', o.val) })),
      sliceXActive: sliceX, sliceYActive: sliceY,
      showLabelToggle: displayMode === 'image',
      labelTrack: showLabels ? '#27408a' : '#d3c4a3', labelKnob: showLabels ? 'translateX(18px)' : 'translateX(0)',
      toggleLabels: () => toggleLabels(),
      gridGap: seam ? '4px' : '0px', gridPad: seam ? '4px' : '0px', gridBg: seam ? '#e3d4b3' : 'transparent',
      seamTrack: seam ? '#27408a' : '#d3c4a3', seamKnob: seam ? 'translateX(18px)' : 'translateX(0)',
      seamLabel: seam ? '有縫' : '無縫',
      toggleSeam: () => toggleSeam(),
      areaW, areaH, tileW, tileH,
      remainderNote: (remW <= 0.05 && remH <= 0.05) ? '' :
        (slice
          ? ('邊緣剩餘 ' + (remW > 0.05 ? ('寬 ' + remW + 'cm') : '') + (remW > 0.05 && remH > 0.05 ? '、' : '') + (remH > 0.05 ? ('高 ' + remH + 'cm') : '') + ' 已用切片磁磚補滿(斜紋)。')
          : ('邊緣剩餘 ' + (remW > 0.05 ? ('寬 ' + remW + 'cm') : '') + (remW > 0.05 && remH > 0.05 ? '、' : '') + (remH > 0.05 ? ('高 ' + remH + 'cm') : '') + ' 不足一片,未計入。開啟切片可補滿。')),
      onAreaW: (e) => setArea('areaW', e.target.value),
      onAreaH: (e) => setArea('areaH', e.target.value),
      onTileW: (e) => setTile('tileW', e.target.value),
      onTileH: (e) => setTile('tileH', e.target.value),
    }
  }
}

// Reusable toggle row used in the Rules card.
function Toggle({ onClick, title, desc, track, knob }) {
  return (
    <div onClick={onClick} style={css('display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer; padding:8px 0;')}>
      <div>
        <div style={css('font-size:15px; font-weight:700;')}>{title}</div>
        <div style={css('font-size:12px; color:#9a8a6b; margin-top:2px;')}>{desc}</div>
      </div>
      <div style={css(`width:46px; height:26px; flex:none; border-radius:14px; background:${track}; position:relative; transition:background .15s;`)}>
        <div style={css(`position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.3); transform:${knob}; transition:transform .15s;`)}></div>
      </div>
    </div>
  )
}

function Divider() {
  return <div style={css('height:1px; background:#ece1cb; margin:6px 0;')}></div>
}
