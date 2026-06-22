import type { View } from '../deriveView'

const numInput = "flex-1 min-w-0 h-[38px] text-center border-[1.5px] border-line rounded-[8px] text-[17px] font-bold text-ink bg-white"

export default function SizeCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div className="font-serif text-[18px] text-azul mb-[14px]">鋪設面積與磁磚尺寸</div>

      <div className="text-[12px] font-bold text-muted2 tracking-[0.5px] mb-[6px]">鋪設面積 (cm)</div>
      <div className="flex items-center gap-[10px] mb-[16px]">
        <input type="number" value={v.areaW} onChange={v.onAreaW} className={numInput} />
        <span className="font-serif text-[#c9b48d] text-[20px]">×</span>
        <input type="number" value={v.areaH} onChange={v.onAreaH} className={numInput} />
        <span className="text-[12px] font-bold text-muted4 whitespace-nowrap">寬 × 高</span>
      </div>

      <div className="text-[12px] font-bold text-muted2 tracking-[0.5px] mb-[6px]">單片磁磚尺寸 (cm)</div>
      <div className="flex items-center gap-[10px]">
        <input type="number" value={v.tileW} onChange={v.onTileW} className={numInput} />
        <span className="font-serif text-[#c9b48d] text-[20px]">×</span>
        <input type="number" value={v.tileH} onChange={v.onTileH} className={numInput} />
        <span className="text-[12px] font-bold text-muted4 whitespace-nowrap">寬 × 高</span>
      </div>

      <div className="mt-[16px] px-[14px] py-[11px] bg-[#eef1f8] border-[1.5px] border-[#c6d0e8] rounded-[9px] flex items-center justify-between gap-[10px]">
        <span className="text-[12px] font-bold text-[#5a6b96] tracking-[0.3px]">計算磁磚數</span>
        <span className="font-serif text-[20px] text-azul">{v.rows} 列 × {v.cols} 欄</span>
      </div>
      <div onClick={v.toggleSlice} className="mt-[14px] flex items-center justify-between gap-[12px] cursor-pointer">
        <div>
          <div className="text-[15px] font-bold">邊緣切片補滿</div>
          <div className="text-[12px] text-muted mt-[2px]">不足一片處補上裁切磁磚(斜紋標示)</div>
        </div>
        <div className="w-[46px] h-[26px] flex-none rounded-[14px] relative transition-[background] duration-150" style={{ background: v.sliceTrack }}>
          <div className="absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.3)] transition-[transform] duration-150" style={{ transform: v.sliceKnob }}></div>
        </div>
      </div>
      {v.showAlign && (
        <div className="mt-[13px] flex flex-col gap-[9px]">
          {v.sliceXActive && (
            <div className="flex items-center gap-[10px]">
              <span className="text-[12px] font-bold text-muted2 w-[40px] flex-none">水平</span>
              <div className="flex gap-[3px] bg-segment rounded-[8px] p-[3px] flex-1">
                {v.alignXOpts.map((o, i) => (
                  <div key={i} onClick={o.onClick} className="flex-1 text-center cursor-pointer text-[13px] font-bold px-[4px] py-[6px] rounded-[6px] transition-[background] duration-[120ms]" style={{ background: o.bg, color: o.fg, boxShadow: o.shadow }}>{o.label}</div>
                ))}
              </div>
            </div>
          )}
          {v.sliceYActive && (
            <div className="flex items-center gap-[10px]">
              <span className="text-[12px] font-bold text-muted2 w-[40px] flex-none">垂直</span>
              <div className="flex gap-[3px] bg-segment rounded-[8px] p-[3px] flex-1">
                {v.alignYOpts.map((o, i) => (
                  <div key={i} onClick={o.onClick} className="flex-1 text-center cursor-pointer text-[13px] font-bold px-[4px] py-[6px] rounded-[6px] transition-[background] duration-[120ms]" style={{ background: o.bg, color: o.fg, boxShadow: o.shadow }}>{o.label}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {v.remainderNote && (
        <div className="text-[11.5px] text-muted mt-[8px] leading-[1.5]">{v.remainderNote}</div>
      )}
    </div>
  )
}
