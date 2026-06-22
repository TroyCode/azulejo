import type { View } from '../deriveView'

export default function QuadCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div className="font-serif text-[18px] text-azul mb-[4px]">2×2 旋轉組</div>
      <div className="text-[12px] text-muted mb-[12px]">選定元素以「四種旋轉拼成 2×2 一組」整組出現(需 4 種變化、數量為 4 的倍數)</div>
      {v.hasQuadOpts && (
        <div className="flex flex-col gap-[8px]">
          {v.quadOptions.map((q, i) => (
            <div key={i} className="flex items-start gap-[9px] flex-wrap">
              <div onClick={q.onToggle} className="flex items-center gap-[7px] cursor-pointer border-[1.5px] rounded-[8px] pt-[6px] pr-[11px] pb-[6px] pl-[7px]" style={{ borderColor: q.border, background: q.bg }}>
                <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[5px] font-extrabold text-[12px]" style={{ background: q.color, color: q.fg }}>{q.name}</span>
                <span className="text-[13px] font-bold" style={{ color: q.textColor }}>{q.label}</span>
              </div>
              {q.on && (
                <>
                  <div className="flex flex-col gap-[5px]">
                    {q.blocks.map((blk, bi) => (
                      <div key={bi} className="flex items-center gap-[6px]">
                        <span className="text-[11px] font-bold text-muted4 w-[30px] flex-none">{blk.label}</span>
                        <div className="flex gap-[2px] bg-segment rounded-[7px] p-[2px]">
                          {blk.angles.map((ang, ai) => (
                            <div key={ai} onClick={ang.onClick} className="cursor-pointer text-[12px] font-bold px-[9px] py-[4px] rounded-[5px]" style={{ background: ang.bg, color: ang.fg, boxShadow: ang.shadow }}>{ang.label}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-[7px] mt-[7px]">
                    <div onClick={q.onPlace} className="cursor-pointer flex items-center gap-[5px] text-[12px] font-extrabold px-[11px] py-[5px] rounded-[7px] border-[1.5px]" style={{ background: q.placeBg, color: q.placeFg, borderColor: q.placeBorder }}>{q.placeLabel}</div>
                    {q.hasPins && (
                      <>
                        <span className="text-[11px] font-bold text-muted3">已釘 {q.pinCount}</span>
                        <div onClick={q.onClearPins} className="cursor-pointer text-[11px] font-bold text-[#c2755c] underline">清除</div>
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
        <div className="text-[13px] text-[#b3a589] italic">尚無符合條件的元素(需設為 4 種變化)。</div>
      )}
    </div>
  )
}
