import type { View } from '../deriveView'

export default function GridView({ v }: { v: View }) {
  return (
    <div className="bg-card border-[1.5px] border-line rounded-[12px] p-[22px]">
      <div className="w-max max-w-full mx-auto">
        <div className="grid rounded-[6px]" style={{ gridTemplateColumns: v.gridCols, gridTemplateRows: v.gridRows, gap: v.gridGap, background: v.gridBg, padding: v.gridPad }}>
          {v.cells.map((cell, i) => (
            <div
              key={i}
              onClick={cell.onCellClick || undefined}
              className="relative overflow-hidden flex items-center justify-center font-extrabold leading-none"
              style={{ cursor: cell.cellCursor, background: cell.bg, color: cell.fg, borderRadius: cell.radius, boxShadow: cell.shadow, fontSize: cell.fontSize }}
            >
              {cell.hasImg && cell.imgEl}
              {cell.showLetter && (<span>{cell.letter}</span>)}
              {cell.showVar && (<span className="absolute right-[3px] bottom-[2px] font-bold opacity-[.78]" style={{ fontSize: cell.varFontSize }}>{cell.variation}</span>)}
              {cell.showChip && (<span className="absolute left-[3px] top-[3px] bg-[rgba(20,16,8,.55)] text-white font-extrabold text-[10px] leading-none px-[4px] py-[2px] rounded-[4px]">{cell.chipText}</span>)}
              {cell.showSliceMark && (<div className="absolute inset-0 pointer-events-none rounded-[3px]" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.85)', WebkitMask: 'repeating-linear-gradient(45deg, #000 0 4px, transparent 4px 8px)', mask: 'repeating-linear-gradient(45deg, #000 0 4px, transparent 4px 8px)' }}></div>)}
              {cell.placeable && (<div className="absolute inset-[1px] pointer-events-none border-[1.5px] border-dashed border-[rgba(39,64,138,.5)] rounded-[3px]"></div>)}
              {cell.showPin && (<div className="absolute left-[2px] top-[2px] w-[13px] h-[13px] pointer-events-none rounded-full flex items-center justify-center text-[8px] font-extrabold" style={{ background: cell.pinColor, color: cell.pinFg, boxShadow: '0 0 0 2px #fff, 0 1px 2px rgba(0,0,0,.4)' }}>⊞</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
