import { css } from '../css.js'

export default function QuadCard({ v }) {
  return (
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
  )
}
