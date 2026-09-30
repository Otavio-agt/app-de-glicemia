import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { salvarExercicio, salvarGlicemia, salvarInsulina, salvarNota, salvarRefeicao } from '../lib/api'
import { useAuth } from '../lib/auth'
import { classificar, ehHipoglicemia, GLICEMIA_MAX, GLICEMIA_MIN, momentoSugerido } from '../lib/glucose'
import { deInputDataHora, paraInputDataHora } from '../lib/format'
import {
  INTENSIDADE_ROTULO,
  MOMENTO_ROTULO,
  type EntryKind,
  type Intensidade,
  type Momento,
  type Origem,
  type TipoInsulina,
} from '../lib/types'
import FaixaBadge from '../components/FaixaBadge'
import AlertaHipo from '../components/AlertaHipo'

const ABAS: { id: EntryKind; rotulo: string }[] = [
  { id: 'glicemia', rotulo: 'Glicemia' },
  { id: 'insulina', rotulo: 'Insulina' },
  { id: 'refeicao', rotulo: 'Refeição' },
  { id: 'exercicio', rotulo: 'Exercício' },
  { id: 'nota', rotulo: 'Nota' },
]

export default function NovoRegistro() {
  const [params, setParams] = useSearchParams()
  const tipo = (ABAS.find((a) => a.id === params.get('tipo'))?.id ?? 'glicemia') as EntryKind

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Novo registro</h1>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={tipo === a.id}
            onClick={() => setParams({ tipo: a.id }, { replace: true })}
            className={`chip shrink-0 ${tipo === a.id ? 'chip-ativo' : ''}`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="cartao">
        {tipo === 'glicemia' && <FormGlicemia key="glicemia" />}
        {tipo === 'insulina' && <FormInsulina key="insulina" />}
        {tipo === 'refeicao' && <FormRefeicao key="refeicao" />}
        {tipo === 'exercicio' && <FormExercicio key="exercicio" />}
        {tipo === 'nota' && <FormNota key="nota" />}
      </div>
    </div>
  )
}

/** Estado e envio comuns a todos os formulários. */
function useEnvio() {
  const navigate = useNavigate()
  const [dataHora, setDataHora] = useState(() => paraInputDataHora(new Date()))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(acao: (quando: string) => Promise<void>, depois?: () => void) {
    setErro(null)
    if (!dataHora) return setErro('Informe a data e a hora.')
    const quando = deInputDataHora(dataHora)
    if (new Date(quando).getTime() > Date.now() + 5 * 60_000) return setErro('A data e a hora não podem estar no futuro.')
    setSalvando(true)
    try {
      await acao(quando)
      if (depois) depois()
      else navigate('/')
    } catch (e) {
      console.error(e)
      setErro('Não foi possível salvar. Verifique a conexão e tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return { dataHora, setDataHora, salvando, erro, setErro, enviar, navigate }
}

function Rodape({
  dataHora,
  setDataHora,
  salvando,
  erro,
}: {
  dataHora: string
  setDataHora: (v: string) => void
  salvando: boolean
  erro: string | null
}) {
  return (
    <>
      <Campo rotulo="Data e hora" id="data-hora">
        <input
          id="data-hora"
          type="datetime-local"
          className="campo"
          value={dataHora}
          max={paraInputDataHora(new Date())}
          onChange={(e) => setDataHora(e.target.value)}
          required
        />
      </Campo>
      {erro && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-faixa-baixa">{erro}</p>}
      <button type="submit" className="botao w-full" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar'}
      </button>
    </>
  )
}

function Campo({ rotulo, id, children }: { rotulo: string; id?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      {children}
    </div>
  )
}

function Opcoes<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
}: {
  rotulo: string
  opcoes: Record<T, string>
  valor: T | null
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="rotulo">{rotulo}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(opcoes) as T[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={valor === k}
            onClick={() => onChange(k)}
            className={`chip ${valor === k ? 'chip-ativo' : ''}`}
          >
            {opcoes[k]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function FormGlicemia() {
  const { limites } = useAuth()
  const envio = useEnvio()
  const [valor, setValor] = useState('')
  const [origem, setOrigem] = useState<Origem>('sensor')
  const [momento, setMomento] = useState<Momento | null>(() => momentoSugerido(new Date()))
  const [nota, setNota] = useState('')
  const [hipo, setHipo] = useState<number | null>(null)

  const numero = Number(valor)
  const valido = valor !== '' && Number.isInteger(numero) && numero >= GLICEMIA_MIN && numero <= GLICEMIA_MAX

  function submeter(e: FormEvent) {
    e.preventDefault()
    if (!valido) return envio.setErro(`Informe um valor inteiro entre ${GLICEMIA_MIN} e ${GLICEMIA_MAX} mg/dL.`)
    if (!momento) return envio.setErro('Escolha o momento da medição.')
    envio.enviar(
      (medido_em) =>
        salvarGlicemia({ valor_mgdl: numero, origem, momento, medido_em, nota: nota.trim() || null }),
      ehHipoglicemia(numero, limites) ? () => setHipo(numero) : undefined,
    )
  }

  return (
    <form onSubmit={submeter} className="space-y-5">
      <Campo rotulo="Valor (mg/dL)" id="valor">
        <div className="flex items-center gap-3">
          <input
            id="valor"
            type="number"
            inputMode="numeric"
            className="campo max-w-40 text-3xl font-extrabold tabular-nums"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="120"
            autoFocus
            required
          />
          {valido && <FaixaBadge faixa={classificar(numero, limites)} />}
        </div>
      </Campo>

      <Opcoes rotulo="Momento" opcoes={MOMENTO_ROTULO} valor={momento} onChange={setMomento} />
      <Opcoes
        rotulo="Como mediu"
        opcoes={{ sensor: 'Sensor', dedo: 'Dedo (glicosímetro)' } as Record<Origem, string>}
        valor={origem}
        onChange={setOrigem}
      />

      <Campo rotulo="Observação (opcional)" id="nota">
        <input id="nota" className="campo" value={nota} onChange={(e) => setNota(e.target.value)} />
      </Campo>

      <Rodape {...envio} />

      {hipo !== null && (
        <AlertaHipo
          valor={hipo}
          muitoBaixa={hipo < limites.muitoBaixa}
          onFechar={() => envio.navigate('/')}
        />
      )}
    </form>
  )
}

function FormInsulina() {
  const envio = useEnvio()
  const [unidades, setUnidades] = useState('')
  const [tipo, setTipo] = useState<TipoInsulina | null>(null)
  const [nota, setNota] = useState('')

  function submeter(e: FormEvent) {
    e.preventDefault()
    const n = Number(unidades.replace(',', '.'))
    if (!(n > 0 && n <= 100) || Math.round(n * 2) !== n * 2) {
      return envio.setErro('Informe as unidades (de 0,5 em 0,5, até 100).')
    }
    if (!tipo) return envio.setErro('Escolha o tipo de insulina.')
    envio.enviar((aplicado_em) => salvarInsulina({ unidades: n, tipo, aplicado_em, nota: nota.trim() || null }))
  }

  return (
    <form onSubmit={submeter} className="space-y-5">
      <Campo rotulo="Unidades (U)" id="unidades">
        <input
          id="unidades"
          type="text"
          inputMode="decimal"
          className="campo max-w-40 text-3xl font-extrabold tabular-nums"
          value={unidades}
          onChange={(e) => setUnidades(e.target.value)}
          placeholder="4"
          autoFocus
          required
        />
      </Campo>
      <Opcoes
        rotulo="Tipo"
        opcoes={{ rapida: 'Rápida (refeição/correção)', lenta: 'Lenta (basal)' } as Record<TipoInsulina, string>}
        valor={tipo}
        onChange={setTipo}
      />
      <Campo rotulo="Observação (opcional)" id="nota">
        <input id="nota" className="campo" value={nota} onChange={(e) => setNota(e.target.value)} />
      </Campo>
      <Rodape {...envio} />
    </form>
  )
}

function FormRefeicao() {
  const envio = useEnvio()
  const [descricao, setDescricao] = useState('')
  const [carbo, setCarbo] = useState('')

  function submeter(e: FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) return envio.setErro('Descreva a refeição.')
    const c = carbo === '' ? null : Number(carbo)
    if (c !== null && !(Number.isInteger(c) && c >= 0 && c <= 500)) {
      return envio.setErro('Carboidratos: número inteiro entre 0 e 500 g.')
    }
    envio.enviar((comido_em) => salvarRefeicao({ descricao: descricao.trim(), carboidratos_g: c, comido_em }))
  }

  return (
    <form onSubmit={submeter} className="space-y-5">
      <Campo rotulo="O que comeu" id="descricao">
        <input
          id="descricao"
          className="campo"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex.: almoço — arroz, feijão, frango e salada"
          autoFocus
          required
        />
      </Campo>
      <Campo rotulo="Carboidratos em gramas (opcional)" id="carbo">
        <input
          id="carbo"
          type="number"
          inputMode="numeric"
          className="campo max-w-40"
          value={carbo}
          onChange={(e) => setCarbo(e.target.value)}
          placeholder="60"
        />
      </Campo>
      <Rodape {...envio} />
    </form>
  )
}

function FormExercicio() {
  const envio = useEnvio()
  const [tipo, setTipo] = useState('')
  const [duracao, setDuracao] = useState('')
  const [intensidade, setIntensidade] = useState<Intensidade | null>(null)

  function submeter(e: FormEvent) {
    e.preventDefault()
    if (!tipo.trim()) return envio.setErro('Informe o tipo de exercício.')
    const d = Number(duracao)
    if (!(Number.isInteger(d) && d >= 1 && d <= 1440)) return envio.setErro('Informe a duração em minutos.')
    if (!intensidade) return envio.setErro('Escolha a intensidade.')
    envio.enviar((feito_em) => salvarExercicio({ tipo: tipo.trim(), duracao_min: d, intensidade, feito_em }))
  }

  return (
    <form onSubmit={submeter} className="space-y-5">
      <Campo rotulo="Exercício" id="tipo">
        <input
          id="tipo"
          className="campo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Ex.: caminhada"
          autoFocus
          required
        />
      </Campo>
      <Campo rotulo="Duração (minutos)" id="duracao">
        <input
          id="duracao"
          type="number"
          inputMode="numeric"
          className="campo max-w-40"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          placeholder="30"
          required
        />
      </Campo>
      <Opcoes rotulo="Intensidade" opcoes={INTENSIDADE_ROTULO} valor={intensidade} onChange={setIntensidade} />
      <Rodape {...envio} />
    </form>
  )
}

function FormNota() {
  const envio = useEnvio()
  const [texto, setTexto] = useState('')

  function submeter(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return envio.setErro('Escreva a nota.')
    envio.enviar((criado_em) => salvarNota({ texto: texto.trim(), criado_em }))
  }

  return (
    <form onSubmit={submeter} className="space-y-5">
      <Campo rotulo="Nota" id="texto">
        <textarea
          id="texto"
          className="campo min-h-28"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex.: gripada hoje, dormi mal, estresse no trabalho…"
          autoFocus
          required
        />
      </Campo>
      <Rodape {...envio} />
    </form>
  )
}
