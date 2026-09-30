import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { supabaseConfigurado } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import NovoRegistro from './pages/NovoRegistro'
import Ajustes from './pages/Ajustes'
import Configurar from './pages/Configurar'

export default function App() {
  if (!supabaseConfigurado) return <Configurar />
  return (
    <AuthProvider>
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </AuthProvider>
  )
}

function Rotas() {
  const { session, carregando } = useAuth()

  if (carregando) {
    return <div className="grid min-h-dvh place-items-center text-suave">Carregando…</div>
  }
  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="novo" element={<NovoRegistro />} />
        <Route path="ajustes" element={<Ajustes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
