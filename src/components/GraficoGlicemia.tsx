import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { classificar, FAIXA_INFO, type Limites } from '../lib/glucose'
import { formatarDiaCurto, formatarHora } from '../lib/format'
import type { Entry } from '../lib/types'

interface Ponto {
  t: number
  glicemia?: number
  insulina?: number
  refeicao?: number
  texto: string
}

interface Props {
  registros: Entry[]
  limites: Limites
  desde: Date
  ate: Date
}

const DIA = 24 * 60 * 60 * 1000

function gerarTicks(desde: Date, ate: Date): number[] {
  const duracao = ate.getTime() - desde.getTime()
  const ticks: number[] = []
  if (duracao <= DIA) {
    const t = new Date(desde)
    t.setMinutes(0, 0, 0)
    t.setHours(Math.ceil(t.getHours() / 6) * 6)
    for (; t <= ate; t.setHours(t.getHours() + 6)) ticks.push(t.getTime())
  } else {
    const passo = duracao <= 8 * DIA ? 1 : 5
    const t = new Date(desde)
    t.setHours(0, 0, 0, 0)
    t.setDate(t.getDate() + 1)
    for (; t <= ate; t.setDate(t.getDate() + passo)) ticks.push(t.getTime())
  }
  return ticks
}

export default function GraficoGlicemia({ registros, limites, desde, ate }: Props) {
  const glicemias = registros.flatMap((r) => (r.kind === 'glicemia' ? [r.data.valor_mgdl] : []))
  const yMax = Math.max(300, Math.ceil((Math.max(0, ...glicemias) + 20) / 50) * 50)
  const yInsulina = yMax - 12
  const yRefeicao = yMax - 32
  const curto = ate.getTime() - desde.getTime() <= DIA

  const pontos: Ponto[] = registros
    .flatMap((r): Ponto[] => {
      const t = new Date(r.at).getTime()
      if (r.kind === 'glicemia') return [{ t, glicemia: r.data.valor_mgdl, texto: `${r.data.valor_mgdl} mg/dL` }]
      if (r.kind === 'insulina') {
        const tipo = r.data.tipo === 'rapida' ? 'rápida' : 'lenta'
        return [{ t, insulina: yInsulina, texto: `Insulina ${tipo}: ${r.data.unidades} U` }]
      }
      if (r.kind === 'refeicao') {
        const carbo = r.data.carboidratos_g != null ? ` (${r.data.carboidratos_g} g)` : ''
        return [{ t, refeicao: yRefeicao, texto: `${r.data.descricao}${carbo}` }]
      }
      return []
    })
    .sort((a, b) => a.t - b.t)

  if (glicemias.length === 0) {
    return (
      <div className="grid h-56 place-items-center rounded-xl bg-fundo text-center text-sm text-suave">
        Nenhuma glicemia registrada neste período.
      </div>
    )
  }

  return (
    <div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={pontos} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-borda)" />
            <ReferenceArea
              y1={limites.baixa}
              y2={limites.alta}
              fill="var(--color-faixa-alvo)"
              fillOpacity={0.08}
              ifOverflow="extendDomain"
            />
            <ReferenceLine y={limites.baixa} stroke="var(--color-faixa-baixa)" strokeDasharray="4 4" />
            <ReferenceLine y={limites.alta} stroke="var(--color-faixa-alta)" strokeDasharray="4 4" />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[desde.getTime(), ate.getTime()]}
              ticks={gerarTicks(desde, ate)}
              tickFormatter={(t: number) => (curto ? formatarHora(new Date(t)) : formatarDiaCurto(new Date(t)))}
              tick={{ fontSize: 12, fill: 'var(--color-suave)' }}
              stroke="var(--color-borda)"
            />
            <YAxis
              domain={[40, yMax]}
              ticks={[limites.baixa, limites.alta, ...(yMax > 300 ? [yMax - 50] : [])]}
              tick={{ fontSize: 12, fill: 'var(--color-suave)' }}
              stroke="var(--color-borda)"
              width={48}
            />
            <Tooltip content={<Dica />} />
            <Line
              dataKey="glicemia"
              connectNulls
              stroke="#a8a29e"
              strokeWidth={1.5}
              isAnimationActive={false}
              dot={(p: { cx?: number; cy?: number; value?: number; index?: number }) => (
                <circle
                  key={p.index}
                  cx={p.cx}
                  cy={p.cy}
                  r={p.value == null ? 0 : 4.5}
                  fill={p.value == null ? 'none' : FAIXA_INFO[classificar(p.value, limites)].cor}
                  stroke="white"
                  strokeWidth={1.5}
                />
              )}
              activeDot={false}
            />
            <Scatter dataKey="insulina" fill="var(--color-insulina)" shape="triangle" isAnimationActive={false} />
            <Scatter dataKey="refeicao" fill="var(--color-refeicao)" shape="square" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-suave">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ background: 'color-mix(in srgb, var(--color-faixa-alvo) 15%, white)' }} />
          Faixa-alvo ({limites.baixa}–{limites.alta})
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ color: 'var(--color-insulina)' }}>▲</span> Insulina
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ color: 'var(--color-refeicao)' }}>■</span> Refeição
        </span>
      </div>
    </div>
  )
}

function Dica({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: Ponto }> }) {
  const p = payload?.[0]?.payload
  if (!active || !p) return null
  return (
    <div className="rounded-xl border border-borda bg-white px-3 py-2 text-sm shadow-md">
      <div className="text-xs text-suave">
        {formatarDiaCurto(new Date(p.t))} · {formatarHora(new Date(p.t))}
      </div>
      <div className="font-bold">{p.texto}</div>
    </div>
  )
}
