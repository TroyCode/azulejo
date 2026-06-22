import { css } from '../css'
import type { View } from '../deriveView'

export default function Header({ v }: { v: View }) {
  return (
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
      <button onClick={v.reshuffle} style={css('border:none; cursor:pointer; background:#c1542d; color:#fff7ec; font-family:\'Karla\',sans-serif; font-weight:800; font-size:15px; padding:13px 22px; border-radius:8px; box-shadow:0 3px 0 #8f3a1d; letter-spacing:0.3px;')}>↻　重新隨機排列</button>
    </div>
  )
}
