# Canaã Delas AI 💜

Plataforma inteligente de saúde feminina para **Canaã dos Carajás**. Auxilia no
acompanhamento do **ciclo menstrual**, **gestação**, **bem-estar emocional** e
**lembretes de exames preventivos**, com orientação personalizada (base para a
futura camada de IA).

> _Tecnologia que cuida, conecta e transforma a vida das mulheres._

## 🧱 Stack

| Camada        | Tecnologia                                      |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 15 (App Router) + React 19              |
| Linguagem     | TypeScript (strict)                             |
| Estilo        | Tailwind CSS v4 + design system próprio         |
| Banco de dados| Prisma ORM + PostgreSQL no Supabase             |
| Autenticação  | Auth.js v5 (NextAuth), credenciais + bcrypt     |
| Validação     | Zod                                             |
| Mutações      | Server Actions                                  |
| Chat / IA     | API da OpenAI (`fetch` + streaming SSE)          |

## 🚀 Começando

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# substitua [YOUR-PASSWORD] pela senha do banco Supabase
# gere um segredo real: npx auth secret  (ou openssl rand -base64 32)

# 3. Aplicar as migrations e popular com dados de demonstração
npm run db:deploy
npm run db:seed

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

**Contas de demonstração** (criadas pelo seed, todas com a senha `senha1234`):

| E-mail | Papel | Onde entra |
| ------ | ----- | ---------- |
| `maria@example.com` | usuária | `/painel` |
| `equipe@example.com` | equipe | `/admin` — tudo |
| `prefeitura@example.com` | prefeitura | `/admin` — campanhas, unidades, indicadores |
| `apoio@example.com` | rede de apoio | `/admin` — contatos de enfrentamento à violência |
| `moderacao@example.com` | moderadora | `/admin` — fila de denúncias |

> Senha igual para todas é aceitável num banco de desenvolvimento e inaceitável
> em qualquer outro lugar. Antes de qualquer piloto, troque as senhas e ative
> 2FA na área administrativa.

## 📜 Scripts

| Script              | Descrição                                         |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                       |
| `npm run build`     | Build de produção (`prisma generate` + `next build`) |
| `npm start`         | Servidor de produção                              |
| `npm run lint`      | ESLint                                            |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`)                |
| `npm run db:migrate`| Cria/aplica migrations no desenvolvimento         |
| `npm run db:deploy` | Aplica migrations existentes no Supabase          |
| `npm run db:seed`   | Popula dados de demonstração                      |
| `npm run db:studio` | Abre o Prisma Studio                              |
| `npm run db:reset`  | Recria o banco e re-semeia                        |

## 📂 Estrutura

```
src/
├── app/
│   ├── (auth)/               # Login e cadastro (layout próprio)
│   ├── (dashboard)/          # Área da usuária
│   │   └── painel/           # Hub de 4 cartões + as telas dos pilares
│   ├── (admin)/admin/        # Área administrativa (papel lido do banco)
│   ├── api/v1/               # REST consumida pelo app Expo
│   ├── api/chat/ · acolhimento/  # Streaming da assistente
│   ├── layout.tsx            # Layout raiz + metadata (SEO)
│   └── globals.css           # Tema Tailwind (tokens da marca)
├── components/
│   ├── ui/                   # Design system (Button, Card, Input…)
│   ├── layout/               # Sidebar contextual por pilar, header, logo
│   ├── admin/                # Navegação e formulários de /admin
│   ├── auth/                 # Formulários de login/cadastro
│   └── features/             # Formulários das features
├── server/
│   ├── actions/              # Server Actions (mutações) por feature
│   │   └── admin.ts          # Escritas administrativas, todas auditadas
│   └── queries.ts            # Leituras reutilizáveis
├── lib/
│   ├── auth.ts               # Auth.js (Node) — providers + bcrypt
│   ├── roles.ts              # requireAdmin / requirePermissao / exigirPermissao
│   ├── audit.ts              # registrar() — só inserção
│   ├── db.ts                 # Cliente Prisma (singleton)
│   ├── session.ts            # requireUser()
│   ├── validations.ts        # Schemas Zod
│   ├── constants.ts          # Enums/opções (SQLite não tem enum nativo)
│   └── utils.ts              # Datas, previsões de ciclo/gestação
├── auth.config.ts            # Config edge-safe (usada pelo middleware)
├── middleware.ts             # Exige sessão em /painel e /admin
└── types/next-auth.d.ts      # Augment da sessão
```

## 🧭 Os quatro pilares

O produto é dividido em quatro áreas, e a navegação segue essa divisão. Antes,
a barra lateral listava 20 páginas em quatro grupos, todas visíveis ao mesmo
tempo — virou um índice do banco de dados, e é a queixa que originou a
reestruturação.

Agora `/painel` é um **hub** de quatro cartões, e a barra lateral mostra **só o
pilar em que você está**. As rotas continuam onde sempre estiveram: reagrupar é
uma mudança de navegação, não de endereço, então link salvo e favorito seguem
valendo.

| Pilar | Cor | Onde começa |
| ----- | --- | ----------- |
| **Proteção** | índigo `#3C4A7D` | `/painel/apoio` |
| **Saúde da Mulher** | coral `#FF5773` | `/painel/ciclo` |
| **Comunidade** | âmbar `#B4652E` | `/painel/comunidade` |
| **Assistente** | lilás `#8B2FA8` | `/painel/assistente` |

A lista está em `packages/core/pilares.ts` e vale para as duas pontas — a web e
o app derivam hub, barra, cor de acento e agrupamento dela.

Duas decisões que parecem detalhe e não são:

- **O pilar se chama "Proteção", nunca "Violência".** Quem olha o celular dela
  de relance não pode ler, na tela inicial, uma palavra que a denuncie. O
  conteúdo lá dentro é explícito; o rótulo de fora não é.
- **O índigo não é vermelho de propósito.** Vermelho já significa sangramento
  neste app e é o acento da marca; e tela vermelha lida de relance parece
  emergência, que é exatamente o que aquela tela não pode parecer.

## 🔐 Área administrativa (`/admin`)

Separada de `/painel`, com o papel lido **do banco a cada requisição** — não do
JWT. Guardar o papel no token seria mais barato e faria uma revogação demorar
até o token expirar; numa área que cadastra telefone de casa-abrigo e aprova
publicidade, "o acesso saiu na hora" vale mais do que uma consulta a menos.

| Papel | Administra |
| ----- | ---------- |
| `equipe` | Tudo, inclusive atribuir papéis e ler a auditoria |
| `prefeitura` | Campanhas (`CityAction`), unidades (`HealthUnit`) e indicadores |
| `rede_apoio` | `SupportService` — os contatos de enfrentamento à violência |
| `moderadora` | Fila de denúncias da comunidade |
| `parceiro` | Envia a própria peça; não publica — só a equipe aprova |

Permissão é concedida por **lista explícita**, nunca por hierarquia implícita
(`packages/core/papeis.ts`): "equipe pode tudo" está escrito como uma lista com
tudo dentro, para que uma permissão nova não caia no colo de ninguém sem alguém
decidir. Seção que a pessoa não pode abrir não aparece apagada — não aparece.

### O cadastro que destrava o pilar Proteção

`SupportService` sempre existiu no schema e o seed sempre a deixou **vazia**,
de propósito: telefone errado numa tela de violência manda alguém em risco para
o lugar errado. Faltava a outra metade da decisão — alguém com uma interface
para cadastrar e **reverificar**.

Agora cada contato guarda `verifiedAt` e `verifiedBy` (nome de uma pessoa, não
um cargo), a data é gravada pelo servidor no momento do salvamento, e
`/api/v1/apoio/servicos` **não devolve contato com verificação vencida** —
passados 90 dias sem alguém confirmar que o número atende, ele sai da tela e
sobram os canais nacionais, que valem em qualquer município e não ficam
desatualizados.

### Indicadores agregados

A Prefeitura vê contagens, nunca nomes nem perfis. Qualquer número abaixo de
**20 pessoas** aparece como "—" (`CORTE_AGREGADO`): Canaã dos Carajás tem cerca
de 77 mil habitantes e as pessoas se reconhecem, então "3 mulheres do bairro X"
não é estatística, é um endereço.

`SosEvent` é gravado **sem `userId`** — serve para dimensionar a rede de apoio,
não para localizar alguém. E `AuditLog` registra apenas o lado administrativo:
nenhuma leitura da usuária no pilar Proteção entra ali, porque a tela dela
promete por escrito que esse rastro não existe.

### Publicidade — três linhas que não se cruzam

1. Nenhum anúncio no pilar Proteção — nem um, nem discreto.
2. Nenhuma segmentação por dado de saúde. A segmentação disponível é cidade e
   bairro, e **não existe campo** para ciclo, humor ou sintoma: um campo desses
   no schema vira uma opção no painel, e uma opção no painel acaba sendo usada.
3. Nenhuma peça que prometa resultado clínico ou diagnóstico.

Toda peça nasce fora do ar e sobe só depois de aprovação manual
(`podePublicar` em `packages/core/parcerias.ts`), sempre rotulada "Parceria".

### Decisões de arquitetura

- **Server Actions para mutações, queries para leitura** — separação clara,
  fácil de testar. Toda action valida com Zod e revalida o cache.
- **Auth em dois arquivos** — `auth.config.ts` (edge-safe, sem Node) para o
  middleware; `lib/auth.ts` (com Prisma/bcrypt) para o restante. Padrão oficial
  do Auth.js v5 para compatibilidade com o Edge Runtime.
- **Isolamento por usuária** — toda action/query filtra por `userId` da sessão;
  exclusões usam `deleteMany({ where: { id, userId } })` para impedir acesso a
  dados de terceiros.
- **Strings validadas em vez de enums nativos** — valores enumerados ficam em
  `lib/constants.ts` e são validados por Zod, facilitando mudanças de política
  pública sem alterar tipos nativos do PostgreSQL.

## 💬 Assistente (chat com IA)

O chat fica em `/painel/assistente` e usa a **API da OpenAI**.

```bash
# .env  — necessário para o chat funcionar
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"   # opcional
```

> Variáveis reais do ambiente do sistema têm precedência sobre o `.env`.
> Se `OPENAI_API_KEY` já existir no ambiente, o app usa aquela.

Como funciona:

- **Conversas isoladas** — cada conversa (`Conversation`) tem seu próprio
  histórico; o contexto enviado ao modelo inclui só as mensagens dela
  (últimas 20).
- **Contexto vivo** (`src/lib/chat-context.ts`) — o prompt de sistema é montado
  a cada mensagem com os dados reais da usuária: fase e dia do ciclo, previsões,
  gestação, humores e sintomas recorrentes.
- **Memória de longo prazo** (`ChatMemory`) — depois de cada troca, uma chamada
  curta extrai apenas **fatos duráveis** (condições, método contraceptivo,
  padrões) e os salva. Esses fatos são reinjetados em **todas** as conversas
  seguintes — é isso que faz a assistente "aprender" com ela. Dados passageiros
  (dia do ciclo, humor de hoje) são explicitamente descartados.
- **Transparência** — a usuária vê tudo o que foi aprendido em
  `/painel/assistente/memoria` e pode apagar com um clique.
- **Segurança clínica** — o prompt proíbe diagnóstico e prescrição, e orienta a
  procurar a UBS ou os telefones de emergência (192 / 180) quando necessário.

### O modo acolhimento não tem memória, e isso é a funcionalidade

`/api/acolhimento` é uma rota separada de `/api/chat` por uma razão que não é
organizacional: **`/api/chat` grava.** Ela persiste cada mensagem, atualiza a
conversa e extrai fatos duráveis para `ChatMemory` — que é justamente o que faz
a assistente parecer conhecer a usuária.

Aqui nada disso pode acontecer. Um registro de "ela relatou agressão em março"
num banco de dados é prova contra ela se o aparelho, a conta ou o servidor
forem acessados por quem não devia. Então a rota não recebe `conversationId`,
não escreve uma linha em tabela nenhuma, não injeta contexto da usuária no
prompt e **não exige autenticação** — exigir login seria vincular a conversa a
uma conta, e quem procura essa tela pode não ter conta.

O prompt mora em `packages/core/protecao.ts` e não junto dos outros, porque é a
única parte do produto em que o texto do prompt *é* a regra de segurança. Duas
proibições que parecem excesso de zelo e não são: **não aconselhar a sair** (o
momento da saída é estatisticamente o de maior risco, e um modelo que não
conhece o caso não sabe se hoje é a hora) e **não perguntar sobre o agressor**
(nome, rotina e endereço não ajudam em nada que a assistente possa fazer, e
transformam a conversa num dossiê contra ela).

## 📱 App (React Native / Expo)

O app mobile é um projeto separado, numa pasta irmã:

```
Documents/
├─ canaadelas/           ← este projeto (web + API + núcleo compartilhado)
└─ canaadelas-mobile/    ← o app Expo
```

Ele consome **a mesma API e as mesmas regras** desta aplicação — não há lógica
de ciclo duplicada. O app importa `packages/core` daqui.

```bash
npm run dev                          # o servidor precisa estar no ar
cd ../canaadelas-mobile && npx expo start
```

> **Atenção ao renomear.** O app aponta para `../canaadelas/packages/core` em
> `metro.config.js` e `tsconfig.json`. Se esta pasta mudar de nome ou lugar,
> ajuste lá — ou defina a variável `CANAA_WEB_DIR` com o nome novo.

**`packages/core`** guarda o que os dois compartilham: matemática de ciclo e
gestação, constantes, schemas Zod e — desde a reestruturação — os quatro
pilares (`pilares.ts`), os papéis e permissões (`papeis.ts`), as regras do
pilar Proteção (`protecao.ts`), as unidades (`unidades.ts`), os exames por
idade (`exames.ts`), o modo acompanhante (`acompanhante.ts`), a política de
publicidade (`parcerias.ts`) e a moderação (`moderacao.ts`). É TypeScript puro
— sem React, Next, Prisma ou DOM. `src/lib/utils.ts`, `constants.ts` e `validations.ts` são reexports
dele, então todo import `@/lib/...` da web segue funcionando.

**`/api/v1/*`** é a camada REST usada pelo app (a web continua nas Server
Actions). Aceita `Authorization: Bearer <token>` ou o cookie de sessão do
Auth.js, então qualquer rota pode ser testada no navegador já logada.

| Rota | Métodos |
| ---- | ------- |
| `/api/v1/auth/login` · `/register` | POST |
| `/api/v1/me` · `/overview` | GET |
| `/api/v1/cycles` · `/moods` · `/daily` · `/reminders` | GET, POST |
| `/api/v1/cycles/:id` · `/reminders/:id` | DELETE, PATCH |
| `/api/v1/conversations` · `/:id` | GET, POST, DELETE |
| `/api/v1/community/posts` · `/:id` · `/:id/replies` | GET, POST, DELETE |
| `/api/v1/community/report` | POST |
| `/api/v1/apoio/servicos` · `/cidade/acoes` | GET (público, sem registro de acesso) |
| `/api/v1/saude/unidades` | GET (público) |
| `/api/v1/protecao/contatos` · `/:id` | GET, POST, PATCH, DELETE |
| `/api/v1/protecao/sos` | POST (sem autenticação e sem `userId` — só conta) |
| `/api/v1/acompanhante` · `/aceitar` | GET, POST, DELETE |
| `/api/chat` | POST (streaming, compartilhada com a web) |
| `/api/acolhimento` | POST (streaming, **sem gravar nada**) |

### Comunidade

Espaço onde as usuárias relatam e respondem umas às outras. Três decisões que
não devem ser afrouxadas sem pensar:

- **O nome real nunca sai da API.** Cada usuária aparece sob um apelido
  derivado do `userId` (`apelidoDe` em `packages/core/community.ts`) — estável,
  para dar continuidade, e irreversível. Dado menstrual e de gestação é dos
  mais sensíveis que existem, e numa cidade de 77 mil habitantes as pessoas se
  reconhecem.
- **Aviso permanente no topo do feed.** Comunidade não é consulta; o texto está
  em `AVISO_COMUNIDADE` e aparece também ao escrever.
- **Três denúncias ocultam automaticamente.** Um app de saúde não pode esperar
  alguém acordar para moderar — é melhor esconder um relato legítimo por engano
  e revisar depois do que deixar desinformação sobre gravidez circulando.

## 📄 Documentação técnica

A documentação técnica completa (32 páginas) fica em `docs/`:

| Arquivo | Conteúdo |
| ------- | -------- |
| `Canaa-Delas-AI-Documentacao-Tecnica.pdf` | Documento final, pronto para distribuição |
| `documentacao-tecnica.html` | Fonte editável (é este arquivo que você altera) |
| `gerar-pdf.mjs` | Conversor HTML → PDF via Chrome/Edge headless |

Inclui requisitos, arquitetura, dicionário de dados, especificação de casos de
uso, algoritmos de domínio, segurança/LGPD, verificação e roadmap — além de
**8 diagramas** (arquitetura, 2 de classes, casos de uso, 2 de sequência,
estados do ciclo e mapa de navegação), desenhados em SVG inline.

Para regerar o PDF após editar o HTML:

```bash
npm run docs:pdf
```

## 🎤 Pitch

O deck do pitch de 3 minutos (Hacka's Start no Futuro 2026) também fica em
`docs/`, seguindo os 9 blocos do roteiro do Encontro 4:

| Arquivo | Conteúdo |
| ------- | -------- |
| `Canaa-Delas-AI-Pitch.pdf` | Deck final, 16:9, pronto para apresentar |
| `pitch.html` | Fonte editável (é este arquivo que você altera) |
| `gerar-pitch-pdf.mjs` | Conversor HTML → PDF via Chrome/Edge headless |

São 21 páginas: capa + 9 blocos do pitch cronometrado, 4 de aprofundamento
(ciclo como sinal vital, janela fértil, demanda de mercado e a grade completa de
funcionalidades), 3 de Canaã dos Carajás (dados municipais, tabela problema →
solução e a metodologia com as contas abertas), 3 anexos de dados nacionais e
internacionais, e uma página final com o roteiro de fala.
Só os 9 blocos cabem nos 3 minutos — o resto é material para a rodada de
perguntas. Os números vêm de INCA, OMS/Globocan, SINASC, Vigitel, IBGE, Flo
Health e Wilcox et al. (NEJM, 1995), com as fontes citadas nas próprias páginas.

Na grade de funcionalidades, cards em bege são **roteiro, não implementado** —
hoje isso vale para o modo parceiro e a rede de clínicas.

Dois blocos estão marcados como pendentes e **precisam ser preenchidos pela
equipe** antes de apresentar: *Validação e evidências* (bloco 5) e *A equipe*
(bloco 9).

```bash
npm run pitch:pdf
```

## 🌱 Próximos passos

- [x] Conexão com serviços públicos de saúde e campanhas municipais (`/admin`)
- [x] Relatórios estatísticos anonimizados (indicadores, corte de 20)
- [x] **PostgreSQL no Supabase**, com pooler transacional para a aplicação e
      pooler de sessão para migrations do Prisma.
- [ ] **Ligar a camada 3 do SOS** — só com convênio assinado e plantão 24h
      confirmado. Sem isso o botão promete resgate que ninguém vai cumprir.
- [ ] **Verificar os telefones da rede de apoio.** O campo "verificado por"
      precisa de um nome de pessoa; enquanto não houver, a tela mostra só 180
      e 190. São cerca de 2 horas por trimestre.
- [ ] Provedor de SMS para a rede de confiança (hoje o app abre o aplicativo de
      mensagens com o texto pronto e ela aperta enviar)
- [ ] 2FA obrigatório em `/admin`
- [ ] Notificações push para lembretes
- [ ] Deploy (Vercel / Neon)

## ⚠️ Aviso

Conteúdo de caráter educativo. **Não substitui** avaliação, diagnóstico ou
acompanhamento por profissionais de saúde.
