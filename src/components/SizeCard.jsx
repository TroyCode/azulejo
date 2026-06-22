import { css } from '../css.js'

export default function SizeCard({ v }) {
  return (
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
  )
}
