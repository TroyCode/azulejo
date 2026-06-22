import type { View } from '../deriveView'

export default function DisplayBar({ v }: { v: View }) {
  return (
    <div className="flex items-center justify-between gap-[12px] flex-wrap">
      <div className="flex items-center gap-[10px]">
        <span className="text-[13px] font-bold text-muted2">顯示方式</span>
        <div className="flex gap-[3px] bg-segment rounded-[8px] p-[3px]">
          {v.modeOpts.map((o, i) => (
            <div key={i} onClick={o.onClick} className="cursor-pointer text-[13px] font-bold px-[16px] py-[6px] rounded-[6px] transition-[background] duration-[120ms]" style={{ background: o.bg, color: o.fg, boxShadow: o.shadow }}>{o.label}</div>
          ))}
        </div>
      </div>
      {v.showLabelToggle && (
        <div onClick={v.toggleLabels} className="flex items-center gap-[8px] cursor-pointer">
          <span className="text-[13px] font-bold text-muted2">顯示代號</span>
          <div className="w-[42px] h-[24px] flex-none rounded-[13px] relative transition-[background] duration-150" style={{ background: v.labelTrack }}>
            <div className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.3)] transition-[transform] duration-150" style={{ transform: v.labelKnob }}></div>
          </div>
        </div>
      )}
      <div onClick={v.toggleSeam} className="flex items-center gap-[8px] cursor-pointer">
        <span className="text-[13px] font-bold text-muted2">{v.seamLabel}</span>
        <div className="w-[42px] h-[24px] flex-none rounded-[13px] relative transition-[background] duration-150" style={{ background: v.seamTrack }}>
          <div className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.3)] transition-[transform] duration-150" style={{ transform: v.seamKnob }}></div>
        </div>
      </div>
    </div>
  )
}
