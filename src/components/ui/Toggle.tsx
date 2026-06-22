interface ToggleProps {
  onClick: () => void
  title: string
  desc: string
  track: string
  knob: string
}

// Reusable labelled toggle row (title + description + switch).
export default function Toggle({ onClick, title, desc, track, knob }: ToggleProps) {
  return (
    <div onClick={onClick} className="flex items-center justify-between gap-[12px] cursor-pointer py-[8px]">
      <div>
        <div className="text-[15px] font-bold">{title}</div>
        <div className="text-[12px] text-muted mt-[2px]">{desc}</div>
      </div>
      <div className="w-[46px] h-[26px] flex-none rounded-[14px] relative transition-[background] duration-150" style={{ background: track }}>
        <div className="absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.3)] transition-[transform] duration-150" style={{ transform: knob }}></div>
      </div>
    </div>
  )
}
