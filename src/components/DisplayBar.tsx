import { css } from '../css'
import type { View } from '../deriveView'

export default function DisplayBar({ v }: { v: View }) {
  return (
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
  )
}
