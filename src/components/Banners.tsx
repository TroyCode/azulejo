import type { View } from '../deriveView'

export default function Banners({ v }: { v: View }) {
  return (
    <>
      {v.placeModeOn && (
        <div className="bg-[#e6eefb] border-[1.5px] border-[#97b3e6] rounded-[10px] px-[16px] py-[11px] text-[13.5px] font-bold text-azul flex items-center gap-[8px]">⊞　放置「{v.placeModeName}」醫章 — 點內圈格子設為 2×2 左上角(再點一次取消),完成後按〔重新排列〕。</div>
      )}
      {v.stale && (
        <div className="bg-[#fdf3dc] border-[1.5px] border-[#e7c873] rounded-[10px] px-[16px] py-[11px] text-[13.5px] font-semibold text-[#9a7012] flex items-center gap-[8px]">⚠　設定已變更 — 按〔重新排列〕套用新結果。</div>
      )}
      {v.hasWarning && (
        <div className="bg-[#fbe5dc] border-[1.5px] border-[#e09a7e] rounded-[10px] px-[16px] py-[11px] text-[13.5px] font-semibold text-[#a8432a] flex items-center gap-[8px]">●　{v.warning}</div>
      )}
    </>
  )
}
