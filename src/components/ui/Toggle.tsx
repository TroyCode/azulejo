import { css } from '../../css'

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
    <div onClick={onClick} style={css('display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer; padding:8px 0;')}>
      <div>
        <div style={css('font-size:15px; font-weight:700;')}>{title}</div>
        <div style={css('font-size:12px; color:#9a8a6b; margin-top:2px;')}>{desc}</div>
      </div>
      <div style={css(`width:46px; height:26px; flex:none; border-radius:14px; background:${track}; position:relative; transition:background .15s;`)}>
        <div style={css(`position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.3); transform:${knob}; transition:transform .15s;`)}></div>
      </div>
    </div>
  )
}
