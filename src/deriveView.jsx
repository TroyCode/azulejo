import { dims, textColor } from './solver.js'

// Pure derivation of every value the UI renders, computed from the current
// state. Handlers are sourced from the actions bag so this stays a plain
// function of (state, actions). Ported from the design's renderVals().
export function deriveView(state, actions) {
  const {
    updateEl, removeEl, addEl, reorder, setArea, setTile, toggleSlice, setAlign, setMode,
    toggleLabels, toggleSeam, toggleColUnique, toggleRowUnique, toggleDisperse, setDispStrength,
    setFp, addForbidden, removeForbidden, toggleQuad, setQuadBlockStart, setPlaceMode, pinAt,
    clearPins, toggleFrame, setFrameWidth, setFrameColor, setImg, clearImg, toggleSudoku,
    toggleEven, reshuffle, dragIndex,
  } = actions

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
