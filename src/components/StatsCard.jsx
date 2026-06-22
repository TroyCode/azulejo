import { css } from '../css.js'

export default function StatsCard({ v }) {
  return (
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
  )
}
