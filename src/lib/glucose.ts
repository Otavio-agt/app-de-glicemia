import type { Momento, Profile } from './types'

export type Faixa = 'muito_baixa' | 'baixa' | 'alvo' | 'alta' | 'muito_alta'

/** Limites em mg/dL. Abaixo de `muitoBaixa` é "muito baixa", abaixo de `baixa` é "baixa",
 *  até `alta` está no alvo, até `muitoAlta` é "alta" e acima disso é "muito alta". */
export interface Limites {
  muitoBaixa: number
  baixa: number
  alta: number
  muitoAlta: number
}

export const LIMITES_PADRAO: Limites = { muitoBaixa: 54, baixa: 70, alta: 180, muitoAlta: 250 }

export const GLICEMIA_MIN = 20
export const GLICEMIA_MAX = 600

export function limitesDoPerfil(p: Profile | null): Limites {
  if (!p) return LIMITES_PADRAO
  return {
    muitoBaixa: p.faixa_muito_baixa,
    baixa: p.faixa_baixa,
    alta: p.faixa_alta,
    muitoAlta: p.faixa_muito_alta,
  }
}

export function classificar(valor: number, l: Limites): Faixa {
  if (valor < l.muitoBaixa) return 'muito_baixa'
  if (valor < l.baixa) return 'baixa'
  if (valor <= l.alta) return 'alvo'
  if (valor <= l.muitoAlta) return 'alta'
  return 'muito_alta'
}

export function ehHipoglicemia(valor: number, l: Limites): boolean {
  return valor < l.baixa
}

export const FAIXA_INFO: Record<Faixa, { rotulo: string; cor: string }> = {
  muito_baixa: { rotulo: 'Muito baixa', cor: 'var(--color-faixa-muito-baixa)' },
  baixa: { rotulo: 'Baixa', cor: 'var(--color-faixa-baixa)' },
  alvo: { rotulo: 'Na faixa', cor: 'var(--color-faixa-alvo)' },
  alta: { rotulo: 'Alta', cor: 'var(--color-faixa-alta)' },
  muito_alta: { rotulo: 'Muito alta', cor: 'var(--color-faixa-muito-alta)' },
}

/** Devolve uma mensagem de erro, ou null se os limites forem válidos. */
export function validarLimites(l: Limites): string | null {
  const valores = [l.muitoBaixa, l.baixa, l.alta, l.muitoAlta]
  if (valores.some((v) => !Number.isInteger(v) || v < GLICEMIA_MIN || v > GLICEMIA_MAX)) {
    return `Use números inteiros entre ${GLICEMIA_MIN} e ${GLICEMIA_MAX}.`
  }
  if (!(l.muitoBaixa < l.baixa && l.baixa < l.alta && l.alta < l.muitoAlta)) {
    return 'Os limites precisam estar em ordem crescente: muito baixa < baixa < alta < muito alta.'
  }
  return null
}

/** Sugere o momento só quando o horário deixa pouca dúvida. Nos outros casos, ela escolhe. */
export function momentoSugerido(data: Date): Momento | null {
  const h = data.getHours()
  if (h < 5) return 'madrugada'
  if (h >= 22) return 'antes_dormir'
  return null
}
