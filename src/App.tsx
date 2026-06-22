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
    <div className="min-h-screen bg-page pt-[28px] px-[28px] pb-[60px] font-sans text-ink">
      <div className="max-w-[1180px] mx-auto">
        <Header v={v} />

        {/* Body: two columns */}
        <div className="grid grid-cols-[374px_1fr] gap-[26px] items-start">

          {/* ============ LEFT: CONTROLS ============ */}
          <div className="flex flex-col gap-[18px]">
            <SizeCard v={v} />
            <RulesCard v={v} />
            <FrameCard v={v} />
            <AdjacencyCard v={v} />
            <QuadCard v={v} />
            <ElementsCard v={v} />
            <button onClick={v.reshuffle} className="border-none cursor-pointer bg-azul text-cream font-extrabold text-[16px] p-[15px] rounded-[10px] shadow-[0_3px_0_#1b2c63] tracking-[0.5px]">重新排列</button>
          </div>

          {/* ============ RIGHT: RESULT ============ */}
          <div className="flex flex-col gap-[18px]">
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
