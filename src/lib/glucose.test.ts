import { describe, expect, it } from 'vitest'
import { classificar, ehHipoglicemia, LIMITES_PADRAO, momentoSugerido, validarLimites } from './glucose'

describe('classificar', () => {
  it.each([
    [40, 'muito_baixa'],
    [53, 'muito_baixa'],
    [54, 'baixa'],
    [69, 'baixa'],
    [70, 'alvo'],
    [180, 'alvo'],
    [181, 'alta'],
    [250, 'alta'],
    [251, 'muito_alta'],
  ])('%i mg/dL é %s', (valor, faixa) => {
    expect(classificar(valor, LIMITES_PADRAO)).toBe(faixa)
  })

  it('respeita limites personalizados', () => {
    const l = { muitoBaixa: 60, baixa: 80, alta: 140, muitoAlta: 200 }
    expect(classificar(75, l)).toBe('baixa')
    expect(classificar(150, l)).toBe('alta')
  })
})

describe('ehHipoglicemia', () => {
  it('é verdadeiro abaixo do limite baixo', () => {
    expect(ehHipoglicemia(69, LIMITES_PADRAO)).toBe(true)
    expect(ehHipoglicemia(70, LIMITES_PADRAO)).toBe(false)
  })
})

describe('validarLimites', () => {
  it('aceita o padrão', () => {
    expect(validarLimites(LIMITES_PADRAO)).toBeNull()
  })
  it('rejeita fora de ordem', () => {
    expect(validarLimites({ muitoBaixa: 70, baixa: 54, alta: 180, muitoAlta: 250 })).not.toBeNull()
  })
  it('rejeita valores absurdos ou quebrados', () => {
    expect(validarLimites({ muitoBaixa: 5, baixa: 70, alta: 180, muitoAlta: 250 })).not.toBeNull()
    expect(validarLimites({ muitoBaixa: 54.5, baixa: 70, alta: 180, muitoAlta: 250 })).not.toBeNull()
  })
})

describe('momentoSugerido', () => {
  it('sugere madrugada e antes de dormir, e nada no resto do dia', () => {
    expect(momentoSugerido(new Date(2026, 0, 1, 3))).toBe('madrugada')
    expect(momentoSugerido(new Date(2026, 0, 1, 23))).toBe('antes_dormir')
    expect(momentoSugerido(new Date(2026, 0, 1, 12))).toBeNull()
  })
})
