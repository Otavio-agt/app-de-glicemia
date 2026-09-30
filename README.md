# Glicemia

Diário de glicemia, insulina, refeições, exercícios e notas. Funciona no computador e no celular (instalável como app).

As decisões do projeto estão em [PREMISSAS.md](PREMISSAS.md).

> Este app é um diário de registros e **não substitui a orientação médica**.

## O que já funciona (MVP)

- Criar conta e entrar (e-mail e senha)
- Registrar glicemia (com momento e origem), insulina, refeição, exercício e nota
- Cores por faixa e faixas personalizáveis em **Ajustes**
- Aviso de hipoglicemia com a regra dos 15
- Gráfico de evolução (24 horas, 7 dias e 30 dias) com marcações de insulina e refeição
- Lista de registros agrupada por dia, com opção de apagar
- Instalável no celular (PWA)

## Como rodar

### 1. Criar o banco no Supabase (gratuito)

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New project**.
2. No projeto, abra **SQL Editor > New query**, cole todo o conteúdo de [supabase/schema.sql](supabase/schema.sql) e clique em **Run**.
3. Em **Project Settings > API**, copie a **Project URL** e a chave **anon / public**.

### 2. Configurar e rodar no computador

```bash
cp .env.example .env   # depois preencha as duas variáveis
npm install
npm run dev            # abre em http://localhost:5173
```

Outros comandos:

```bash
npm test          # testes das regras de faixa
npm run build     # versão de produção em dist/
```

### 3. Publicar (Vercel, gratuito)

1. Suba o projeto para o GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New > Project** e importe o repositório.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Faça o deploy. Depois, no Supabase, em **Authentication > URL Configuration**, coloque o endereço da Vercel em **Site URL**. Isso faz o link do e-mail de confirmação apontar para o app.

O arquivo `vercel.json` já garante que rotas como `/ajustes` funcionem ao recarregar a página.

### 4. Instalar no celular

- **Android (Chrome):** abra o site e toque em **Instalar app** (ou menu ⋮ > *Adicionar à tela inicial*).
- **iPhone (Safari):** abra o site, toque em **Compartilhar** e depois em *Adicionar à Tela de Início*.

## Estrutura

```
supabase/schema.sql       tabelas, segurança (RLS) e criação automática do perfil
src/lib/glucose.ts        regras das faixas (com testes em glucose.test.ts)
src/lib/api.ts            leitura e gravação no Supabase
src/lib/auth.tsx          sessão e perfil da usuária
src/pages/                Início, Novo registro, Ajustes, Login
src/components/           gráfico, aviso de hipoglicemia, layout
```

## Tecnologias

React + TypeScript + Vite, Tailwind CSS, Recharts, Supabase e vite-plugin-pwa.
