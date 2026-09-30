/** Mostrada quando o arquivo .env ainda não foi preenchido. */
export default function Configurar() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="cartao space-y-3">
        <h1 className="text-2xl font-extrabold">Falta configurar o Supabase</h1>
        <ol className="list-decimal space-y-2 pl-5 text-texto">
          <li>
            Copie o arquivo <code className="rounded bg-fundo px-1">.env.example</code> para{' '}
            <code className="rounded bg-fundo px-1">.env</code>.
          </li>
          <li>Preencha a URL e a chave pública do seu projeto Supabase.</li>
          <li>
            Reinicie o servidor (<code className="rounded bg-fundo px-1">npm run dev</code>).
          </li>
        </ol>
        <p className="text-sm text-suave">O passo a passo completo está no README.md.</p>
      </div>
    </div>
  )
}
