import { supabase } from './supabase'
import type {
  Entry,
  EntryKind,
  Exercise,
  GlucoseReading,
  InsulinDose,
  Meal,
  Note,
  Profile,
} from './types'

const TABELAS: Record<EntryKind, { tabela: string; tempo: string }> = {
  glicemia: { tabela: 'glucose_readings', tempo: 'medido_em' },
  insulina: { tabela: 'insulin_doses', tempo: 'aplicado_em' },
  refeicao: { tabela: 'meals', tempo: 'comido_em' },
  exercicio: { tabela: 'exercises', tempo: 'feito_em' },
  nota: { tabela: 'notes', tempo: 'criado_em' },
}

async function buscar<T>(kind: EntryKind, desde: Date): Promise<T[]> {
  const { tabela, tempo } = TABELAS[kind]
  const { data, error } = await supabase
    .from(tabela)
    .select('*')
    .gte(tempo, desde.toISOString())
    .order(tempo, { ascending: false })
  if (error) throw error
  return data as T[]
}

/** Todos os registros desde `desde`, do mais recente para o mais antigo. */
export async function buscarRegistros(desde: Date): Promise<Entry[]> {
  const [glicemias, insulinas, refeicoes, exercicios, notas] = await Promise.all([
    buscar<GlucoseReading>('glicemia', desde),
    buscar<InsulinDose>('insulina', desde),
    buscar<Meal>('refeicao', desde),
    buscar<Exercise>('exercicio', desde),
    buscar<Note>('nota', desde),
  ])
  const todos: Entry[] = [
    ...glicemias.map((data) => ({ kind: 'glicemia' as const, at: data.medido_em, data })),
    ...insulinas.map((data) => ({ kind: 'insulina' as const, at: data.aplicado_em, data })),
    ...refeicoes.map((data) => ({ kind: 'refeicao' as const, at: data.comido_em, data })),
    ...exercicios.map((data) => ({ kind: 'exercicio' as const, at: data.feito_em, data })),
    ...notas.map((data) => ({ kind: 'nota' as const, at: data.criado_em, data })),
  ]
  return todos.sort((a, b) => b.at.localeCompare(a.at))
}

export async function buscarUltimaGlicemia(): Promise<GlucoseReading | null> {
  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .order('medido_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as GlucoseReading | null
}

async function inserir(kind: EntryKind, valores: object) {
  const { error } = await supabase.from(TABELAS[kind].tabela).insert(valores)
  if (error) throw error
}

export const salvarGlicemia = (v: Omit<GlucoseReading, 'id'>) => inserir('glicemia', v)
export const salvarInsulina = (v: Omit<InsulinDose, 'id'>) => inserir('insulina', v)
export const salvarRefeicao = (v: Omit<Meal, 'id'>) => inserir('refeicao', v)
export const salvarExercicio = (v: Omit<Exercise, 'id'>) => inserir('exercicio', v)
export const salvarNota = (v: Omit<Note, 'id'>) => inserir('nota', v)

export async function apagarRegistro(kind: EntryKind, id: string) {
  const { error } = await supabase.from(TABELAS[kind].tabela).delete().eq('id', id)
  if (error) throw error
}

export async function buscarPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function salvarPerfil(p: Profile) {
  const { error } = await supabase.from('profiles').upsert(p)
  if (error) throw error
}
