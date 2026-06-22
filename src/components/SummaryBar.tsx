import { css } from '../css'
import type { View } from '../deriveView'

export default function SummaryBar({ v }: { v: View }) {
  return (
    <div style={css('display:flex; flex-wrap:wrap; gap:10px;')}>
      <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
        <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#27408a;')}>{v.rows}×{v.cols}</span>
        <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>＝ {v.totalCells} 格</span>
      </div>
      <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
        <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#5d8a5a;')}>{v.filledCount}</span>
        <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>已填</span>
        <span style={css('font-size:12px; color:#c0ad88;')}>/ 留白 {v.emptyCount}</span>
      </div>
      <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
        <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#c1542d;')}>{v.totalQty}</span>
        <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>可用磁磚總數</span>
      </div>
      <div title={v.combosTitle} style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
        <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#27408a;')}>{v.combosLabel}</span>
        <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>種排列組合</span>
      </div>
      <div title="同種元素之間的平均曼哈頓距離(水平/垂直移動一格＝1),數字越大代表分布越分散" style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:10px; padding:10px 16px; display:flex; align-items:baseline; gap:8px;')}>
        <span style={css('font-family:\'DM Serif Display\',serif; font-size:22px; color:#5d8a5a;')}>{v.avgDistLabel}</span>
        <span style={css('font-size:12px; color:#9a8a6b; font-weight:600;')}>平均間距</span>
      </div>
    </div>
  )
}
