import type { View } from '../deriveView'

export default function Header({ v }: { v: View }) {
  return (
    <div className="flex items-end justify-between gap-[24px] flex-wrap pb-[18px] border-b-2 border-b-[#c9b48d] mb-[24px]">
      <div className="flex items-center gap-[18px]">
        <div className="w-[54px] h-[54px] flex-none rounded-[8px] bg-azul grid grid-cols-2 grid-rows-2 gap-[3px] p-[6px] shadow-[0_2px_0_#1b2c63]">
          <div className="bg-gold rounded-[2px]"></div>
          <div className="bg-[#f4ecdb] rounded-[2px]"></div>
          <div className="bg-[#f4ecdb] rounded-[2px]"></div>
          <div className="bg-terra rounded-[2px]"></div>
        </div>
        <div>
          <div className="font-serif text-[32px] leading-none text-azul tracking-[0.2px]">花磚排列計算器</div>
          <div className="text-[14px] text-muted3 mt-[6px] font-medium">Azulejo — 自動排出每個 3×3 視窗不重複的花磚佈局</div>
        </div>
      </div>
      <button onClick={v.reshuffle} className="border-none cursor-pointer bg-terra text-cream font-extrabold text-[15px] px-[22px] py-[13px] rounded-[8px] shadow-[0_3px_0_#8f3a1d] tracking-[0.3px]">↻　重新隨機排列</button>
    </div>
  )
}
