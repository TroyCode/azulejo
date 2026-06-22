import { css } from '../css.js'

export default function GridView({ v }) {
  return (
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
  )
}
