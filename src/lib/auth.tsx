import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { buscarPerfil } from './api'
import { limitesDoPerfil, type Limites } from './glucose'
import type { Profile } from './types'

interface AuthState {
  session: Session | null
  carregando: boolean
  perfil: Profile | null
  limites: Limites
  recarregarPerfil: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Profile | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCarregando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSession(nova))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id

  const recarregarPerfil = useCallback(async () => {
    if (!userId) {
      setPerfil(null)
      return
    }
    setPerfil(await buscarPerfil(userId))
  }, [userId])

  useEffect(() => {
    recarregarPerfil().catch(console.error)
  }, [recarregarPerfil])

  return (
    <AuthContext.Provider
      value={{ session, carregando, perfil, limites: limitesDoPerfil(perfil), recarregarPerfil }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
