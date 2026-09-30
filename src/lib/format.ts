const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const diaCurto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const diaLongo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatarHora = (d: Date | string) => hora.format(new Date(d))
export const formatarDiaCurto = (d: Date | string) => diaCurto.format(new Date(d))

export function formatarDia(d: Date | string): string {
  const data = new Date(d)
  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(hoje.getDate() - 1)
  if (data.toDateString() === hoje.toDateString()) return 'Hoje'
  if (data.toDateString() === ontem.toDateString()) return 'Ontem'
  const texto = diaLongo.format(data)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function formatarHaQuanto(d: Date | string): string {
  const min = Math.round((Date.now() - new Date(d).getTime()) / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const dias = Math.floor(h / 24)
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}

/** Valor para <input type="datetime-local"> no fuso local. */
export function paraInputDataHora(d: Date): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function deInputDataHora(valor: string): string {
  return new Date(valor).toISOString()
}
