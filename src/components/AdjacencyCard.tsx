import type { View } from '../deriveView'

export default function AdjacencyCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div className="font-serif text-[18px] text-azul mb-[4px]">相鄰限制</div>
      <div className="text-[12px] text-muted mb-[12px]">指定兩種元素不可上下或左右相鄰</div>

      {v.hasForbidden && (
        <div className="flex flex-wrap gap-[6px] mb-[12px]">
          {v.forbiddenView.map((f, i) => (
            <div key={i} className="flex items-center gap-[7px] bg-[#fbe5dc] border-[1.5px] border-[#e0a98e] rounded-[8px] pt-[5px] pr-[6px] pb-[5px] pl-[10px]">
              <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[5px] font-extrabold text-[11px]" style={{ background: f.colorA, color: f.fgA }}>{f.a}</span>
              <span className="text-[13px] font-extrabold text-[#a8432a]">⊘</span>
              <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[5px] font-extrabold text-[11px]" style={{ background: f.colorB, color: f.fgB }}>{f.b}</span>
              <div onClick={f.onRemove} className="cursor-pointer text-[#c2755c] text-[16px] leading-none px-[2px]">×</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-[7px]">
        <select value={v.fpA} onChange={v.onFpA} className="flex-1 h-[36px] border-[1.5px] border-line rounded-[7px] px-[8px] text-[14px] font-bold text-ink bg-white cursor-pointer">
          {v.elNames.map((n, i) => (<option key={i} value={n}>{n}</option>))}
        </select>
        <span className="text-[13px] font-extrabold text-[#a8432a] flex-none">⊘</span>
        <select value={v.fpB} onChange={v.onFpB} className="flex-1 h-[36px] border-[1.5px] border-line rounded-[7px] px-[8px] text-[14px] font-bold text-ink bg-white cursor-pointer">
          {v.elNames.map((n, i) => (<option key={i} value={n}>{n}</option>))}
        </select>
        <button onClick={v.addForbidden} className="flex-none h-[36px] px-[14px] border-none cursor-pointer bg-azul text-cream font-extrabold text-[14px] rounded-[7px]">新增</button>
      </div>
    </div>
  )
}
