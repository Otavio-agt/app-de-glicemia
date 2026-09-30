export type Origem = 'sensor' | 'dedo'
export type Momento = 'jejum' | 'antes_refeicao' | 'depois_refeicao' | 'antes_dormir' | 'madrugada' | 'outro'
export type TipoInsulina = 'rapida' | 'lenta'
export type Intensidade = 'leve' | 'moderada' | 'intensa'

export interface Profile {
  id: string
  nome: string | null
  faixa_muito_baixa: number
  faixa_baixa: number
  faixa_alta: number
  faixa_muito_alta: number
}

export interface GlucoseReading {
  id: string
  valor_mgdl: number
  medido_em: string
  origem: Origem
  momento: Momento
  nota: string | null
}

export interface InsulinDose {
  id: string
  unidades: number
  tipo: TipoInsulina
  aplicado_em: string
  nota: string | null
}

export interface Meal {
  id: string
  descricao: string
  carboidratos_g: number | null
  comido_em: string
}

export interface Exercise {
  id: string
  tipo: string
  duracao_min: number
  intensidade: Intensidade
  feito_em: string
}

export interface Note {
  id: string
  texto: string
  criado_em: string
}

export type Entry =
  | { kind: 'glicemia'; at: string; data: GlucoseReading }
  | { kind: 'insulina'; at: string; data: InsulinDose }
  | { kind: 'refeicao'; at: string; data: Meal }
  | { kind: 'exercicio'; at: string; data: Exercise }
  | { kind: 'nota'; at: string; data: Note }

export type EntryKind = Entry['kind']

export const MOMENTO_ROTULO: Record<Momento, string> = {
  jejum: 'Jejum',
  antes_refeicao: 'Antes de comer',
  depois_refeicao: 'Depois de comer',
  antes_dormir: 'Antes de dormir',
  madrugada: 'Madrugada',
  outro: 'Outro',
}

export const INTENSIDADE_ROTULO: Record<Intensidade, string> = {
  leve: 'Leve',
  moderada: 'Moderada',
  intensa: 'Intensa',
}
