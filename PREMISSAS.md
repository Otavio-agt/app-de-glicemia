# Premissas do Projeto: App de Glicemia

> Documento gerado a partir da entrevista de definição do projeto (29/09/2026).

## 1. Objetivo

Web app para **registrar e acompanhar a glicemia** da minha irmã, que funcione bem no **computador e no celular**.

> **Importante:** o app **não mede** a glicemia. Quem mede é o glicosímetro ou o sensor. O app serve para **registrar, visualizar e compartilhar** as medições.
>
> **Aviso:** o app **não é um dispositivo médico** e **não recomenda doses de insulina**. Ele é só um diário organizado. As decisões de tratamento são da paciente com a equipe médica.

## 2. Contexto da usuária

| Item | Resposta |
|---|---|
| Tipo de diabetes | Ainda não confirmado (perguntar a ela). Como usa insulina, o app atende Tipo 1 e Tipo 2 |
| Forma de medição | **Sensor contínuo** (tipo FreeStyle Libre) **e glicosímetro** de ponta de dedo |
| Insulina | **Sim**, aplicada com caneta ou seringa |
| Unidade | mg/dL (padrão no Brasil) |
| Idioma | Português (Brasil) |

## 3. Mini-glossário (para quem não conhece diabetes)

- **Glicemia:** quantidade de açúcar (glicose) no sangue, medida em mg/dL.
- **Hipoglicemia:** açúcar baixo (< 70 mg/dL). Pode ser perigosa e precisa de ação rápida.
- **Hiperglicemia:** açúcar alto (> 180 mg/dL).
- **Faixa-alvo:** intervalo considerado bom, geralmente 70–180 mg/dL. Quem define é o médico.
- **Tempo no alvo (TIR):** % das medições dentro da faixa-alvo. É uma métrica muito usada pelos médicos.
- **Insulina rápida (bolus):** aplicada nas refeições ou para corrigir glicemia alta.
- **Insulina lenta (basal):** aplicada 1 ou 2 vezes ao dia e age o dia todo.
- **Hemoglobina glicada (HbA1c):** média da glicemia dos últimos ~3 meses, medida em exame de sangue. O app pode mostrar uma **estimativa** (GMI) a partir das medições.
- **Regra dos 15:** na hipoglicemia, consumir 15 g de carboidrato rápido e medir de novo após 15 minutos.

## 4. Usuários e permissões

- **Dona da conta (minha irmã):** acesso total.
- **Convidados (família, médico, nutricionista):** ela convida pelo e-mail e escolhe **por pessoa** a permissão:
  - **Visualizar:** vê gráficos, estatísticas e relatórios.
  - **Visualizar e registrar:** também pode adicionar registros.
- Ela pode revogar o acesso de qualquer convidado a qualquer momento.
- Login obrigatório. Os dados ficam na nuvem e sincronizam entre celular e PC.

## 5. Funcionalidades

### 5.1 Registros (entrada **manual**)
- **Glicemia:** valor em mg/dL, data e hora, origem (sensor ou dedo) e **momento** (jejum, antes da refeição, depois da refeição, antes de dormir, madrugada, outro).
- **Insulina:** unidades, tipo (rápida ou lenta) e data e hora.
- **Refeição:** descrição e carboidratos em gramas (opcional).
- **Exercício:** tipo, duração e intensidade.
- **Observações:** nota livre (doença, estresse, menstruação etc.).

> Não haverá integração automática com o sensor nem importação de CSV, pelo menos por enquanto.

### 5.2 Alertas e faixas
- **Cores por faixa** em todas as telas:
  - Muito baixa (< 54): vermelho escuro
  - Baixa (54–69): vermelho
  - Na faixa (70–180): verde
  - Alta (181–250): amarelo/laranja
  - Muito alta (> 250): laranja escuro
- **Aviso de hipoglicemia:** ao registrar um valor < 70, mostrar mensagem em destaque com a regra dos 15 e sugerir medir de novo.
- **Faixas personalizáveis:** ela ajusta os limites conforme a orientação médica. Os valores acima são o padrão.
- **Lembretes:** notificações nos horários definidos por ela (medir glicemia, aplicar insulina).
- A família **não** recebe notificação de hipoglicemia por enquanto (fica para uma versão futura).

### 5.3 Visualização
- **Gráfico de evolução:** linha da glicemia por dia, semana e mês, com a faixa-alvo sombreada e marcadores de insulina e refeição.
- **Estatísticas do período:** média, % no alvo, abaixo e acima, nº de hipoglicemias e HbA1c estimada (GMI = 3,31 + 0,02392 × média em mg/dL).
- **Relatório para o médico:** resumo de um período (ex.: últimos 14 ou 30 dias) em página imprimível ou PDF.

## 6. Escopo por versão

### MVP (v1): prioridade
1. Cadastro e login
2. Registro de glicemia (com momento), insulina, refeição, exercício e observação
3. Cores por faixa, com faixas personalizáveis
4. Aviso de hipoglicemia na tela
5. Gráfico de evolução (dia, semana e mês)
6. Layout responsivo e instalável no celular (PWA)

### v2
- Estatísticas completas (TIR, GMI, nº de hipos)
- Convites com permissão por pessoa
- Relatório para o médico (imprimir ou PDF)
- Lembretes com notificação push

### Futuro (ideias)
- Notificar a família em caso de hipoglicemia
- Importar CSV do app do sensor
- Modo escuro, exportar dados

## 7. Premissas técnicas

| Item | Decisão |
|---|---|
| Frontend | React + TypeScript + Vite |
| Estilo | Tailwind CSS, mobile-first |
| Gráficos | Recharts (ou Chart.js) |
| Backend / banco / login | **Supabase** (Postgres + Auth + Row Level Security) |
| Hospedagem | **Vercel** (plano gratuito) |
| Mobile | **PWA**: instala na tela inicial do celular, sem loja de apps |
| Notificações | Web Push, com envio agendado por Supabase Edge Function + cron |
| Custo | **Somente planos gratuitos** |

**Pontos de atenção:**
- No **iPhone**, a notificação push só funciona se o app estiver **instalado na tela inicial** (iOS 16.4 ou mais recente).
- O plano gratuito do Supabase **pausa o projeto após 7 dias sem uso**. Com uso diário isso não acontece.
- Os dados de saúde são **dados sensíveis pela LGPD**. Por isso: acesso só com login, regras de segurança no banco (RLS) para que cada convidado veja apenas o que foi autorizado, HTTPS e nenhum dado em logs públicos.

## 8. Modelo de dados (rascunho)

- `profiles`: id, nome, faixas personalizadas (muito_baixa, baixa, alta, muito_alta)
- `glucose_readings`: id, user_id, valor_mgdl, medido_em, origem (sensor/dedo), momento, nota
- `insulin_doses`: id, user_id, unidades, tipo (rápida/lenta), aplicado_em, nota
- `meals`: id, user_id, descricao, carboidratos_g, comido_em
- `exercises`: id, user_id, tipo, duracao_min, intensidade, feito_em
- `notes`: id, user_id, texto, criado_em
- `shares`: id, owner_id, convidado_email, convidado_id, permissao (ver/registrar), status
- `reminders`: id, user_id, titulo, horario, dias_semana, ativo
- `push_subscriptions`: id, user_id, endpoint, chaves

## 9. Pendências (a confirmar)

- [ ] **Tipo de diabetes** da minha irmã
- [ ] **Faixas-alvo** que o médico dela recomenda
- [ ] Quais **insulinas** ela usa (nomes e se usa rápida e lenta)
- [ ] **Preferências visuais:** nome do app, cores e estilo
- [ ] Horários típicos de medição e aplicação (para os lembretes)
