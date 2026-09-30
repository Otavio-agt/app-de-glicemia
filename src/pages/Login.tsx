import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { IconGota } from '../components/icons'

type Modo = 'entrar' | 'criar'

export default function Login() {
  const [modo, setModo] = useState<Modo>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) setErro(traduzirErro(error.message))
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome: nome.trim() } },
        })
        if (error) setErro(traduzirErro(error.message))
        else if (!data.session) {
          setAviso('Conta criada! Enviamos um e-mail de confirmação. Clique no link e depois entre aqui.')
          setModo('entrar')
        }
      }
    } catch {
      setErro('Sem conexão com o servidor. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-marca text-white">
            <IconGota width={34} height={34} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold">Glicemia</h1>
          <p className="mt-1 text-suave">Seu diário de glicemia, insulina e refeições</p>
        </div>

        <div className="cartao">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-fundo p-1">
            {(['entrar', 'criar'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setModo(m)
                  setErro(null)
                }}
                className={`rounded-lg py-2 text-sm font-bold transition ${
                  modo === m ? 'bg-white text-marca shadow-sm' : 'text-suave'
                }`}
              >
                {m === 'entrar' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="space-y-4">
            {modo === 'criar' && (
              <div>
                <label htmlFor="nome" className="rotulo">
                  Nome
                </label>
                <input
                  id="nome"
                  className="campo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="rotulo">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="campo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="senha" className="rotulo">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                className="campo"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
              {modo === 'criar' && <p className="mt-1 text-xs text-suave">Mínimo de 6 caracteres.</p>}
            </div>

            {erro && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-faixa-baixa">{erro}</p>}
            {aviso && <p className="rounded-xl bg-marca-clara p-3 text-sm font-semibold text-marca-escura">{aviso}</p>}

            <button type="submit" className="botao w-full" disabled={enviando}>
              {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function traduzirErro(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'
  if (msg.includes('already registered')) return 'Este e-mail já tem conta. Use "Entrar".'
  if (msg.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.'
  return msg
}
