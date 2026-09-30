import { FAIXA_INFO, type Faixa } from '../lib/glucose'

export default function FaixaBadge({ faixa }: { faixa: Faixa }) {
  const { rotulo, cor } = FAIXA_INFO[faixa]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ color: cor, backgroundColor: `color-mix(in srgb, ${cor} 12%, white)` }}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: cor }} />
      {rotulo}
    </span>
  )
}
