import type { View } from '../deriveView'

export default function FrameCard({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[18px]">
      <div onClick={v.toggleFrame} className="flex items-center justify-between gap-[12px] cursor-pointer">
        <div>
          <div className="font-serif text-[18px] text-azul">四周畫框</div>
          <div className="text-[12px] text-muted mt-[2px]">外圈不鋪磁磚,留單色邊框</div>
        </div>
        <div className="w-[46px] h-[26px] flex-none rounded-[14px] relative transition-[background] duration-150" style={{ background: v.frameTrack }}>
          <div className="absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.3)] transition-[transform] duration-150" style={{ transform: v.frameKnob }}></div>
        </div>
      </div>
      {v.frameOn && (
        <div className="flex items-center gap-[16px] mt-[14px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[12px] font-bold text-muted2">厚度</span>
            <button onClick={v.decFrame} className="w-[30px] h-[32px] border-[1.5px] border-line bg-[#f4ecdb] rounded-[7px] text-[18px] font-bold text-muted3 cursor-pointer">−</button>
            <span className="min-w-[42px] text-center text-[14px] font-extrabold text-ink">{v.frameWidthLabel}</span>
            <button onClick={v.incFrame} className="w-[30px] h-[32px] border-[1.5px] border-line bg-[#f4ecdb] rounded-[7px] text-[18px] font-bold text-muted3 cursor-pointer">+</button>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className="text-[12px] font-bold text-muted2">顏色</span>
            <input type="color" value={v.frameColor} onChange={v.onFrameColor} className="w-[34px] h-[32px]" />
          </div>
        </div>
      )}
    </div>
  )
}
