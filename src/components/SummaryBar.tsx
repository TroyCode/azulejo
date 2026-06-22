import type { View } from '../deriveView'

export default function SummaryBar({ v }: { v: View }) {
  return (
    <div className="flex flex-wrap gap-[10px]">
      <div className="bg-card border-[1.5px] border-line rounded-[10px] px-[16px] py-[10px] flex items-baseline gap-[8px]">
        <span className="font-serif text-[22px] text-azul">{v.rows}×{v.cols}</span>
        <span className="text-[12px] text-muted font-semibold">＝ {v.totalCells} 格</span>
      </div>
      <div className="bg-card border-[1.5px] border-line rounded-[10px] px-[16px] py-[10px] flex items-baseline gap-[8px]">
        <span className="font-serif text-[22px] text-sage">{v.filledCount}</span>
        <span className="text-[12px] text-muted font-semibold">已填</span>
        <span className="text-[12px] text-[#c0ad88]">/ 留白 {v.emptyCount}</span>
      </div>
      <div className="bg-card border-[1.5px] border-line rounded-[10px] px-[16px] py-[10px] flex items-baseline gap-[8px]">
        <span className="font-serif text-[22px] text-terra">{v.totalQty}</span>
        <span className="text-[12px] text-muted font-semibold">可用磁磚總數</span>
      </div>
      <div title={v.combosTitle} className="bg-card border-[1.5px] border-line rounded-[10px] px-[16px] py-[10px] flex items-baseline gap-[8px]">
        <span className="font-serif text-[22px] text-azul">{v.combosLabel}</span>
        <span className="text-[12px] text-muted font-semibold">種排列組合</span>
      </div>
      <div title="同種元素之間的平均曼哈頓距離(水平/垂直移動一格＝1),數字越大代表分布越分散" className="bg-card border-[1.5px] border-line rounded-[10px] px-[16px] py-[10px] flex items-baseline gap-[8px]">
        <span className="font-serif text-[22px] text-sage">{v.avgDistLabel}</span>
        <span className="text-[12px] text-muted font-semibold">平均間距</span>
      </div>
    </div>
  )
}
