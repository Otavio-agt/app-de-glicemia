import { NavLink, Outlet } from 'react-router-dom'
import { IconAjustes, IconCasa, IconGota, IconMais } from './icons'

const itens = [
  { to: '/', rotulo: 'Início', Icone: IconCasa, end: true },
  { to: '/novo', rotulo: 'Registrar', Icone: IconMais, end: false },
  { to: '/ajustes', rotulo: 'Ajustes', Icone: IconAjustes, end: false },
]

export default function Layout() {
  return (
    <div className="min-h-dvh pb-24 sm:pb-8">
      <header className="sticky top-0 z-10 border-b border-borda bg-fundo/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-extrabold text-marca">
            <IconGota />
            Glicemia
          </NavLink>
          <nav className="hidden gap-1 sm:flex">
            {itens.map(({ to, rotulo, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-marca-clara text-marca-escura' : 'text-suave hover:text-texto'
                  }`
                }
              >
                {rotulo}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <Outlet />
      </main>

      {/* Navegação inferior no celular */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-borda bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="grid grid-cols-3">
          {itens.map(({ to, rotulo, Icone, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold ${
                  isActive ? 'text-marca' : 'text-suave'
                }`
              }
            >
              <Icone />
              {rotulo}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
