import type { View } from '../deriveView'

const rowCols = "grid grid-cols-[16px_28px_30px_1fr_44px_38px_16px] gap-[6px] items-center"

export default function ElementsCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div className="flex items-baseline justify-between mb-[4px]">
        <div className="font-serif text-[18px] text-azul">元素</div>
        <div className="text-[12px] text-muted">拖曳 ⠿ 調整優先順序(上＝優先)</div>
      </div>

      <div className={`${rowCols} pt-[8px] px-[2px] pb-[6px] text-[11px] font-bold text-muted4 tracking-[0.3px]`}>
        <div></div><div>色</div><div>圖</div><div>名稱</div><div className="text-center">數量</div><div className="text-center">變化</div><div></div>
      </div>

      <div className="flex flex-col gap-[6px]">
        {v.elementsView.map((el, i) => (
          <div key={i} draggable onDragStart={el.onDragStart} onDragOver={el.onDragOver} onDrop={el.onDrop} className={`${rowCols} bg-white border-[1.5px] border-line2 rounded-[8px] px-[8px] py-[6px]`}>
            <div className="cursor-grab text-[#c4b48f] text-[15px] text-center leading-none select-none">⠿</div>
            <input type="color" value={el.color} onChange={el.onColor} className="w-[28px] h-[30px]" />
            <label className="relative w-[30px] h-[30px] rounded-[6px] cursor-pointer overflow-hidden border border-line2 flex items-center justify-center bg-[#f4ecdb]">
              <input type="file" accept="image/*" onChange={el.onImg} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {el.hasImg && el.imgEl}
              {el.noImg && (<span className="text-[15px] text-[#b3a07c] font-bold pointer-events-none">＋</span>)}
            </label>
            <input type="text" value={el.name} onChange={el.onName} className="w-full h-[32px] border border-line2 rounded-[6px] px-[8px] text-[15px] font-bold text-ink" />
            <input type="number" value={el.quantity} onChange={el.onQty} className="w-full h-[32px] text-center border border-line2 rounded-[6px] text-[14px] font-semibold text-ink" />
            <input type="number" value={el.variations} onChange={el.onVar} className="w-full h-[32px] text-center border border-line2 rounded-[6px] text-[14px] font-semibold text-ink" />
            <div onClick={el.onRemove} className="cursor-pointer text-[#cbb48f] text-[17px] text-center leading-none">×</div>
          </div>
        ))}
      </div>

      <button onClick={v.addEl} className="w-full mt-[12px] border-[1.5px] border-dashed border-[#cbb98f] bg-transparent text-muted2 font-bold text-[14px] p-[10px] rounded-[8px] cursor-pointer">＋ 新增元素</button>
    </div>
  )
}
