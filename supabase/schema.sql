-- Schema do App de Glicemia
-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > colar > Run.

-- Perfil de cada usuária, com as faixas personalizáveis (mg/dL)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text,
  faixa_muito_baixa int not null default 54,
  faixa_baixa int not null default 70,
  faixa_alta int not null default 180,
  faixa_muito_alta int not null default 250,
  created_at timestamptz not null default now(),
  constraint faixas_em_ordem check (
    faixa_muito_baixa < faixa_baixa
    and faixa_baixa < faixa_alta
    and faixa_alta < faixa_muito_alta
  )
);

create table if not exists public.glucose_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  valor_mgdl int not null check (valor_mgdl between 20 and 600),
  medido_em timestamptz not null default now(),
  origem text not null check (origem in ('sensor', 'dedo')),
  momento text not null check (momento in ('jejum', 'antes_refeicao', 'depois_refeicao', 'antes_dormir', 'madrugada', 'outro')),
  nota text,
  created_at timestamptz not null default now()
);

create table if not exists public.insulin_doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  unidades numeric(5,1) not null check (unidades > 0 and unidades <= 100),
  tipo text not null check (tipo in ('rapida', 'lenta')),
  aplicado_em timestamptz not null default now(),
  nota text,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  descricao text not null,
  carboidratos_g int check (carboidratos_g between 0 and 500),
  comido_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  tipo text not null,
  duracao_min int not null check (duracao_min between 1 and 1440),
  intensidade text not null check (intensidade in ('leve', 'moderada', 'intensa')),
  feito_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  texto text not null,
  criado_em timestamptz not null default now()
);

create index if not exists glucose_readings_user_time on public.glucose_readings (user_id, medido_em desc);
create index if not exists insulin_doses_user_time on public.insulin_doses (user_id, aplicado_em desc);
create index if not exists meals_user_time on public.meals (user_id, comido_em desc);
create index if not exists exercises_user_time on public.exercises (user_id, feito_em desc);
create index if not exists notes_user_time on public.notes (user_id, criado_em desc);

-- Row Level Security: cada usuária só enxerga e altera os próprios dados.
-- (O compartilhamento com família e médico entra na v2.)
alter table public.profiles enable row level security;
alter table public.glucose_readings enable row level security;
alter table public.insulin_doses enable row level security;
alter table public.meals enable row level security;
alter table public.exercises enable row level security;
alter table public.notes enable row level security;

drop policy if exists "perfil proprio" on public.profiles;
create policy "perfil proprio" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "dados proprios" on public.glucose_readings;
create policy "dados proprios" on public.glucose_readings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dados proprios" on public.insulin_doses;
create policy "dados proprios" on public.insulin_doses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dados proprios" on public.meals;
create policy "dados proprios" on public.meals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dados proprios" on public.exercises;
create policy "dados proprios" on public.exercises
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dados proprios" on public.notes;
create policy "dados proprios" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome');
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();
