import { css } from '../css'
import type { View } from '../deriveView'

export default function AdjacencyCard({ v }: { v: View }) {
  return (
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
  )
}
