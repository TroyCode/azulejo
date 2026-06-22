import { css } from './css'
import { useCalculator } from './useCalculator'
import { deriveView } from './deriveView'
import Header from './components/Header'
import SizeCard from './components/SizeCard'
import RulesCard from './components/RulesCard'
import FrameCard from './components/FrameCard'
import AdjacencyCard from './components/AdjacencyCard'
import QuadCard from './components/QuadCard'
import ElementsCard from './components/ElementsCard'
import SummaryBar from './components/SummaryBar'
import Banners from './components/Banners'
import DisplayBar from './components/DisplayBar'
import GridView from './components/GridView'
import StatsCard from './components/StatsCard'

export default function App() {
  const { state, actions } = useCalculator()
  const v = deriveView(state, actions)

  return (
    <div style={css('min-height:100vh; background:#e9dfca; padding:28px 28px 60px; font-family:\'Karla\',sans-serif; color:#34291b;')}>
      <div style={css('max-width:1180px; margin:0 auto;')}>
        <Header v={v} />

        {/* Body: two columns */}
        <div style={css('display:grid; grid-template-columns:374px 1fr; gap:26px; align-items:start;')}>

          {/* ============ LEFT: CONTROLS ============ */}
          <div style={css('display:flex; flex-direction:column; gap:18px;')}>
            <SizeCard v={v} />
            <RulesCard v={v} />
            <FrameCard v={v} />
            <AdjacencyCard v={v} />
            <QuadCard v={v} />
            <ElementsCard v={v} />
            <button onClick={v.reshuffle} style={css('border:none; cursor:pointer; background:#27408a; color:#fff7ec; font-family:\'Karla\',sans-serif; font-weight:800; font-size:16px; padding:15px; border-radius:10px; box-shadow:0 3px 0 #1b2c63; letter-spacing:0.5px;')}>重新排列</button>
          </div>

          {/* ============ RIGHT: RESULT ============ */}
          <div style={css('display:flex; flex-direction:column; gap:18px;')}>
            <SummaryBar v={v} />
            <Banners v={v} />
            <DisplayBar v={v} />
            <GridView v={v} />
            <StatsCard v={v} />
          </div>
        </div>
      </div>
    </div>
  )
}
