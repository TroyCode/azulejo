import { css } from '../css.js'

export default function FrameCard({ v }) {
  return (
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
  )
}
