import { css } from '../css'
import type { View } from '../deriveView'

export default function Banners({ v }: { v: View }) {
  return (
    <>
      {v.placeModeOn && (
        <div style={css('background:#e6eefb; border:1.5px solid #97b3e6; border-radius:10px; padding:11px 16px; font-size:13.5px; font-weight:700; color:#27408a; display:flex; align-items:center; gap:8px;')}>⊞　放置「{v.placeModeName}」醫章 — 點內圈格子設為 2×2 左上角(再點一次取消),完成後按〔重新排列〕。</div>
      )}
      {v.stale && (
        <div style={css('background:#fdf3dc; border:1.5px solid #e7c873; border-radius:10px; padding:11px 16px; font-size:13.5px; font-weight:600; color:#9a7012; display:flex; align-items:center; gap:8px;')}>⚠　設定已變更 — 按〔重新排列〕套用新結果。</div>
      )}
      {v.hasWarning && (
        <div style={css('background:#fbe5dc; border:1.5px solid #e09a7e; border-radius:10px; padding:11px 16px; font-size:13.5px; font-weight:600; color:#a8432a; display:flex; align-items:center; gap:8px;')}>●　{v.warning}</div>
      )}
    </>
  )
}
