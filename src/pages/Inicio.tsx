import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { apagarRegistro, buscarRegistros, buscarUltimaGlicemia } from '../lib/api'
import { useAuth } from '../lib/auth'
import { classificar, FAIXA_INFO, type Limites } from '../lib/glucose'
import { formatarDia, formatarHaQuanto, formatarHora } from '../lib/format'
import { INTENSIDADE_ROTULO, MOMENTO_ROTULO, type Entry, type GlucoseReading } from '../lib/types'
import GraficoGlicemia from '../components/GraficoGlicemia'
import FaixaBadge from '../components/FaixaBadge'
import { IconCorrida, IconGota, IconLixo, IconMais, IconNota, IconPrato, IconSeringa } from '../components/icons'

type Periodo = '24h' | '7d' | '30d'

const PERIODOS: { id: Periodo; rotulo: string; horas: number }[] = [
  { id: '24h', rotulo: '24 horas', horas: 24 },
  { id: '7d', rotulo: '7 dias', horas: 24 * 7 },
  { id: '30d', rotulo: '30 dias', horas: 24 * 30 },
]

export default function Inicio() {
  const { perfil, limites } = useAuth()
  const [periodo, setPeriodo] = useState<Periodo>('24h')
  const [registros, setRegistros] = useState<Entry[]>([])
  const [ultima, setUltima] = useState<GlucoseReading | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const { desde, ate } = useMemo(() => {
    const ate = new Date()
    const horas = PERIODOS.find((p) => p.id === periodo)!.horas
    return { desde: new Date(ate.getTime() - horas * 3600_000), ate }
  }, [periodo])

  const carregar = useCallback(async () => {
    setErro(null)
    try {
      const [lista, ultimaGlicemia] = await Promise.all([buscarRegistros(desde), buscarUltimaGlicemia()])
      setRegistros(lista)
      setUltima(ultimaGlicemia)
    } catch (e) {
      console.error(e)
      setErro('Não foi possível carregar os registros. Verifique a conexão.')
    } finally {
      setCarregando(false)
    }
  }, [desde])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function apagar(r: Entry) {
    if (!confirm('Apagar este registro?')) return
    try {
      await apagarRegistro(r.kind, r.data.id)
      await carregar()
    } catch (e) {
      console.error(e)
      alert('Não foi possível apagar. Tente de novo.')
    }
  }

  const primeiroNome = perfil?.nome?.split(' ')[0]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!'}</h1>

      {erro && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-faixa-baixa">{erro}</p>}

      <UltimaGlicemia ultima={ultima} limites={limites} carregando={carregando} />

      <AtalhosRegistro />

      <section className="cartao">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold">Evolução</h2>
          <div className="flex gap-1 rounded-xl bg-fundo p-1" role="tablist">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={periodo === p.id}
                onClick={() => setPeriodo(p.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  periodo === p.id ? 'bg-white text-marca shadow-sm' : 'text-suave'
                }`}
              >
                {p.rotulo}
              </button>
            ))}
          </div>
        </div>
        <GraficoGlicemia registros={registros} limites={limites} desde={desde} ate={ate} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">Registros</h2>
        {!carregando && registros.length === 0 ? (
          <div className="cartao text-center text-suave">
            Nada registrado neste período.{' '}
            <Link to="/novo" className="font-bold text-marca underline">
              Fazer o primeiro registro
            </Link>
          </div>
        ) : (
          <ListaRegistros registros={registros} limites={limites} onApagar={apagar} />
        )}
      </section>
    </div>
  )
}

function UltimaGlicemia({
  ultima,
  limites,
  carregando,
}: {
  ultima: GlucoseReading | null
  limites: Limites
  carregando: boolean
}) {
  if (carregando) return <div className="cartao h-32 animate-pulse" />
  if (!ultima) {
    return (
      <div className="cartao">
        <p className="text-suave">Nenhuma glicemia registrada ainda.</p>
      </div>
    )
  }
  const faixa = classificar(ultima.valor_mgdl, limites)
  return (
    <section className="cartao flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-suave">Última glicemia</p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-5xl font-extrabold tabular-nums" style={{ color: FAIXA_INFO[faixa].cor }}>
            {ultima.valor_mgdl}
          </span>
          <span className="font-bold text-suave">mg/dL</span>
        </p>
        <p className="mt-1 text-sm text-suave">
          {formatarHaQuanto(ultima.medido_em)} · {MOMENTO_ROTULO[ultima.momento]}
        </p>
      </div>
      <FaixaBadge faixa={faixa} />
    </section>
  )
}

const ATALHOS = [
  { tipo: 'glicemia', rotulo: 'Glicemia', Icone: IconGota, cor: 'var(--color-marca)' },
  { tipo: 'insulina', rotulo: 'Insulina', Icone: IconSeringa, cor: 'var(--color-insulina)' },
  { tipo: 'refeicao', rotulo: 'Refeição', Icone: IconPrato, cor: 'var(--color-refeicao)' },
  { tipo: 'exercicio', rotulo: 'Exercício', Icone: IconCorrida, cor: 'var(--color-exercicio)' },
  { tipo: 'nota', rotulo: 'Nota', Icone: IconNota, cor: 'var(--color-nota)' },
] as const

function AtalhosRegistro() {
  return (
    <section className="grid grid-cols-5 gap-2">
      {ATALHOS.map(({ tipo, rotulo, Icone, cor }) => (
        <Link
          key={tipo}
          to={`/novo?tipo=${tipo}`}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-borda bg-white px-1 py-3 text-xs font-bold transition hover:border-marca sm:text-sm"
        >
          <span className="relative" style={{ color: cor }}>
            <Icone width={26} height={26} />
            <IconMais
              width={12}
              height={12}
              strokeWidth={3}
              className="absolute -right-1.5 -top-1 rounded-full bg-white"
            />
          </span>
          {rotulo}
        </Link>
      ))}
    </section>
  )
}

function ListaRegistros({
  registros,
  limites,
  onApagar,
}: {
  registros: Entry[]
  limites: Limites
  onApagar: (r: Entry) => void
}) {
  const grupos = new Map<string, Entry[]>()
  for (const r of registros) {
    const dia = formatarDia(r.at)
    grupos.set(dia, [...(grupos.get(dia) ?? []), r])
  }

  return (
    <div className="space-y-4">
      {[...grupos].map(([dia, itens]) => (
        <div key={dia}>
          <h3 className="mb-2 text-sm font-bold text-suave">{dia}</h3>
          <ul className="divide-y divide-borda overflow-hidden rounded-2xl border border-borda bg-white">
            {itens.map((r) => (
              <li key={`${r.kind}-${r.data.id}`} className="flex items-center gap-3 px-4 py-3">
                <span className="w-12 shrink-0 text-sm tabular-nums text-suave">{formatarHora(r.at)}</span>
                <div className="min-w-0 flex-1">
                  <LinhaRegistro r={r} limites={limites} />
                </div>
                <button
                  onClick={() => onApagar(r)}
                  className="shrink-0 rounded-lg p-2 text-suave transition hover:bg-red-50 hover:text-faixa-baixa"
                  aria-label="Apagar registro"
                >
                  <IconLixo width={18} height={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function LinhaRegistro({ r, limites }: { r: Entry; limites: Limites }) {
  switch (r.kind) {
    case 'glicemia': {
      const faixa = classificar(r.data.valor_mgdl, limites)
      return (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-extrabold tabular-nums" style={{ color: FAIXA_INFO[faixa].cor }}>
              {r.data.valor_mgdl}
            </span>
            <span className="text-sm text-suave">mg/dL</span>
            <FaixaBadge faixa={faixa} />
          </div>
          <Detalhe>
            {MOMENTO_ROTULO[r.data.momento]} · {r.data.origem === 'sensor' ? 'Sensor' : 'Dedo'}
            {r.data.nota && ` · ${r.data.nota}`}
          </Detalhe>
        </>
      )
    }
    case 'insulina':
      return (
        <>
          <Titulo cor="var(--color-insulina)" Icone={IconSeringa}>
            {r.data.unidades} U · insulina {r.data.tipo === 'rapida' ? 'rápida' : 'lenta'}
          </Titulo>
          {r.data.nota && <Detalhe>{r.data.nota}</Detalhe>}
        </>
      )
    case 'refeicao':
      return (
        <>
          <Titulo cor="var(--color-refeicao)" Icone={IconPrato}>
            {r.data.descricao}
          </Titulo>
          {r.data.carboidratos_g != null && <Detalhe>{r.data.carboidratos_g} g de carboidrato</Detalhe>}
        </>
      )
    case 'exercicio':
      return (
        <>
          <Titulo cor="var(--color-exercicio)" Icone={IconCorrida}>
            {r.data.tipo}
          </Titulo>
          <Detalhe>
            {r.data.duracao_min} min · {INTENSIDADE_ROTULO[r.data.intensidade]}
          </Detalhe>
        </>
      )
    case 'nota':
      return (
        <Titulo cor="var(--color-nota)" Icone={IconNota}>
          <span className="font-semibold">{r.data.texto}</span>
        </Titulo>
      )
  }
}

function Titulo({
  cor,
  Icone,
  children,
}: {
  cor: string
  Icone: typeof IconGota
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-2 font-bold">
      <span style={{ color: cor }} className="shrink-0">
        <Icone width={18} height={18} />
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
}

function Detalhe({ children }: { children: ReactNode }) {
  return <p className="truncate text-sm text-suave">{children}</p>
}
