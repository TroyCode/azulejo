import { css } from '../css'
import type { View } from '../deriveView'
import Toggle from './ui/Toggle'
import Divider from './ui/Divider'

export default function RulesCard({ v }: { v: View }) {
  return (
    <div style={css('background:#fbf6ec; border:1.5px solid #d9c8a4; border-radius:12px; padding:18px;')}>
      <div style={css('font-family:\'DM Serif Display\',serif; font-size:18px; color:#27408a; margin-bottom:14px;')}>排列規則</div>

      <Toggle onClick={v.toggleSudoku} title="九宮格不重複" desc="任一 3×3 視窗內 9 格皆相異(類數獨)" track={v.sudokuTrack} knob={v.sudokuKnob} />
      <Divider />
      <Toggle onClick={v.toggleEven} title="平均使用元素" desc="關閉時改為「由上而下依優先序多用」" track={v.evenTrack} knob={v.evenKnob} />
      <Divider />
      <Toggle onClick={v.toggleCol} title="直排不重複" desc="每一直行內元素皆相異" track={v.colTrack} knob={v.colKnob} />
      <Divider />
      <Toggle onClick={v.toggleRow} title="橫排不重複" desc="每一橫列內元素皆相異" track={v.rowTrack} knob={v.rowKnob} />
      <Divider />
      <Toggle onClick={v.toggleDisperse} title="最大化分散度" desc="模擬退火優化,拉開同種元素間距" track={v.dispTrack} knob={v.dispKnob} />
      {v.disperse && (
        <div style={css('padding:4px 2px 6px;')}>
          <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;')}>
            <span style={css('font-size:12px; font-weight:700; color:#8a7a5b;')}>優化強度</span>
            <span style={css('font-size:12px; font-weight:800; color:#27408a;')}>{v.dispStrengthLabel}</span>
          </div>
          <input type="range" min="1" max="5" step="1" value={v.disperseStrength} onChange={v.onDispStrength} style={css('width:100%; accent-color:#27408a; cursor:pointer;')} />
        </div>
      )}
    </div>
  )
}
