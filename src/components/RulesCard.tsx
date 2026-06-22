import type { View } from '../deriveView'
import Toggle from './ui/Toggle'
import Divider from './ui/Divider'

export default function RulesCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div className="font-serif text-[18px] text-azul mb-[14px]">排列規則</div>

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
        <div className="px-[2px] pt-[4px] pb-[6px]">
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[12px] font-bold text-muted2">優化強度</span>
            <span className="text-[12px] font-extrabold text-azul">{v.dispStrengthLabel}</span>
          </div>
          <input type="range" min="1" max="5" step="1" value={v.disperseStrength} onChange={v.onDispStrength} className="w-full accent-azul cursor-pointer" />
        </div>
      )}
    </div>
  )
}
