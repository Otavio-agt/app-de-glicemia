import { useEffect, useState, type FormEvent } from 'react'
import { salvarPerfil } from '../lib/api'
import { useAuth } from '../lib/auth'
import { FAIXA_INFO, LIMITES_PADRAO, validarLimites, type Limites } from '../lib/glucose'
import { supabase } from '../lib/supabase'

const CAMPOS: { chave: keyof Limites; rotulo: string; ajuda: string; cor: string }[] = [
  { chave: 'muitoBaixa', rotulo: 'Muito baixa abaixo de', ajuda: 'Padrão: 54', cor: FAIXA_INFO.muito_baixa.cor },
  { chave: 'baixa', rotulo: 'Baixa (hipoglicemia) abaixo de', ajuda: 'Padrão: 70', cor: FAIXA_INFO.baixa.cor },
  { chave: 'alta', rotulo: 'Alta acima de', ajuda: 'Padrão: 180', cor: FAIXA_INFO.alta.cor },
  { chave: 'muitoAlta', rotulo: 'Muito alta acima de', ajuda: 'Padrão: 250', cor: FAIXA_INFO.muito_alta.cor },
]

export default function Ajustes() {
  const { session, perfil, limites, recarregarPerfil } = useAuth()
  const [nome, setNome] = useState('')
  const [valores, setValores] = useState<Record<keyof Limites, string>>(paraTexto(limites))
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    setNome(perfil?.nome ?? '')
    setValores(paraTexto(limites))
  }, [perfil])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setMensagem(null)
    const novos: Limites = {
      muitoBaixa: Number(valores.muitoBaixa),
      baixa: Number(valores.baixa),
      alta: Number(valores.alta),
      muitoAlta: Number(valores.muitoAlta),
    }
    const erro = validarLimites(novos)
    if (erro) return setMensagem({ tipo: 'erro', texto: erro })

    setSalvando(true)
    try {
      await salvarPerfil({
        id: session!.user.id,
        nome: nome.trim() || null,
        faixa_muito_baixa: novos.muitoBaixa,
        faixa_baixa: novos.baixa,
        faixa_alta: novos.alta,
        faixa_muito_alta: novos.muitoAlta,
      })
      await recarregarPerfil()
      setMensagem({ tipo: 'ok', texto: 'Ajustes salvos.' })
    } catch (err) {
      console.error(err)
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar. Tente de novo.' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Ajustes</h1>

      <form onSubmit={salvar} className="space-y-5">
        <section className="cartao space-y-4">
          <h2 className="text-lg font-extrabold">Perfil</h2>
          <div>
            <label htmlFor="nome" className="rotulo">
              Nome
            </label>
            <input id="nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <p className="text-sm text-suave">E-mail: {session?.user.email}</p>
        </section>

        <section className="cartao space-y-4">
          <div>
            <h2 className="text-lg font-extrabold">Faixas de glicemia (mg/dL)</h2>
            <p className="mt-1 text-sm text-suave">
              Ajuste conforme a orientação do seu médico. Elas definem as cores e o aviso de hipoglicemia.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CAMPOS.map(({ chave, rotulo, ajuda, cor }) => (
              <div key={chave}>
                <label htmlFor={chave} className="rotulo flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                  {rotulo}
                </label>
                <input
                  id={chave}
                  type="number"
                  inputMode="numeric"
                  className="campo"
                  value={valores[chave]}
                  onChange={(e) => setValores({ ...valores, [chave]: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-suave">{ajuda}</p>
              </div>
            ))}
          </div>
          <p className="text-sm">
            Na faixa-alvo: de <strong>{valores.baixa || '?'}</strong> a <strong>{valores.alta || '?'}</strong> mg/dL.
          </p>
          <button type="button" className="text-sm font-bold text-marca underline" onClick={() => setValores(paraTexto(LIMITES_PADRAO))}>
            Voltar aos valores padrão
          </button>
        </section>

        {mensagem && (
          <p
            className={`rounded-xl p-3 text-sm font-semibold ${
              mensagem.tipo === 'ok' ? 'bg-marca-clara text-marca-escura' : 'bg-red-50 text-faixa-baixa'
            }`}
            role="status"
          >
            {mensagem.texto}
          </p>
        )}

        <button type="submit" className="botao w-full" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar ajustes'}
        </button>
      </form>

      <button className="botao-secundario w-full" onClick={() => supabase.auth.signOut()}>
        Sair da conta
      </button>

      <p className="text-center text-xs text-suave">
        Este app é um diário de registros e não substitui a orientação médica.
      </p>
    </div>
  )
}

function paraTexto(l: Limites): Record<keyof Limites, string> {
  return {
    muitoBaixa: String(l.muitoBaixa),
    baixa: String(l.baixa),
    alta: String(l.alta),
    muitoAlta: String(l.muitoAlta),
  }
}
