import { IconAlerta } from './icons'

interface Props {
  valor: number
  muitoBaixa: boolean
  onFechar: () => void
}

/** Aviso mostrado logo após registrar uma glicemia abaixo do limite baixo. */
export default function AlertaHipo({ valor, muitoBaixa, onFechar }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4 sm:place-items-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="hipo-titulo"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 text-faixa-baixa">
          <IconAlerta width={32} height={32} />
          <h2 id="hipo-titulo" className="text-xl font-extrabold">
            Glicemia {muitoBaixa ? 'muito baixa' : 'baixa'}: {valor} mg/dL
          </h2>
        </div>

        <div className="mt-4 rounded-2xl bg-red-50 p-4">
          <p className="font-extrabold text-faixa-muito-baixa">Regra dos 15</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-texto">
            <li>
              Consuma <strong>15 g de carboidrato rápido</strong>: meio copo (150 ml) de suco de
              laranja ou refrigerante comum, ou 1 colher de sopa de açúcar ou mel.
            </li>
            <li>
              Espere <strong>15 minutos</strong> e meça de novo.
            </li>
            <li>Se continuar baixa, repita.</li>
          </ol>
        </div>

        <p className="mt-4 text-sm text-suave">
          Se houver confusão, desmaio ou dificuldade para engolir, <strong>ligue 192 (SAMU)</strong>.
          Siga sempre a orientação do seu médico.
        </p>

        <button type="button" className="botao mt-5 w-full" onClick={onFechar} autoFocus>
          Entendi
        </button>
      </div>
    </div>
  )
}
