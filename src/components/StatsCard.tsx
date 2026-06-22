import type { View } from '../deriveView'

export default function StatsCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div className="font-serif text-[18px] text-azul mb-[14px]">使用統計</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-[10px]">
        {v.statsView.map((s, i) => (
          <div key={i} className="border-[1.5px] border-line2 rounded-[9px] px-[12px] py-[10px] bg-white">
            <div className="flex items-center gap-[8px]">
              <div className="w-[22px] h-[22px] flex-none rounded-[5px] flex items-center justify-center font-extrabold text-[12px]" style={{ background: s.color, color: s.fg }}>{s.name}</div>
              <div className="text-[15px] font-extrabold text-ink">{s.usedLabel}</div>
              {s.full && (<div className="ml-auto text-[10px] font-extrabold text-sage bg-[#e8f0e3] px-[6px] py-[2px] rounded-[5px]">滿</div>)}
            </div>
            {s.hasVar && (
              <div className="flex flex-wrap gap-[5px] mt-[8px]">
                {s.breakdown.map((b, bi) => (
                  <div key={bi} className="text-[11px] font-bold text-muted3 bg-[#f4ecdb] rounded-[5px] px-[7px] py-[2px]">{b.label}<span className="text-[#b3a07c]">·</span>{b.count}</div>
                ))}
              </div>
            )}
            {s.hasDist && (
              <div className="flex gap-[12px] mt-[9px] pt-[8px] border-t border-t-[#f0e7d3]">
                <div className="flex items-baseline gap-[4px]">
                  <span className="text-[14px] font-extrabold text-sage">{s.avgDistLabel}</span>
                  <span className="text-[10px] font-bold text-muted4">平均間距</span>
                </div>
                <div className="flex items-baseline gap-[4px]">
                  <span className="text-[14px] font-extrabold text-terra">{s.minDistLabel}</span>
                  <span className="text-[10px] font-bold text-muted4">最近</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
