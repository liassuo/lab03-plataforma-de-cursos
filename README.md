# LAB03 - Plataforma de Cursos Online

Sistema de gerenciamento de uma plataforma de cursos online com backend em NestJS
e frontend em React com TypeScript.

## Tecnologias

- **Backend:** NestJS, Prisma ORM, SQLite, JWT (Passport), bcrypt, Swagger
- **Frontend:** React, TypeScript, Vite, React Router, Bootstrap 5

## Como rodar

### Kafka (mensageria)

O backend precisa do Kafka rodando antes de iniciar (se o Kafka não estiver no ar, o backend
encerra com erro de conexão). Com o Docker Desktop aberto:

```bash
docker compose up -d kafka
```

### Backend

```bash
cd backend
npm install
npx prisma migrate dev   # cria o banco dev.db e roda o seed
npm run start:dev
```

A API sobe em `http://localhost:3000` e a documentação Swagger fica em
`http://localhost:3000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

E acessar `http://localhost:5173`.

### Mobile (React Native + Expo)

O app roda no celular pelo **Expo Go** (instale pela Play Store).

```bash
cd mobile
npm install
npx expo start     # leia o QR Code com o app Expo Go
```

- O celular e o computador precisam estar **na mesma rede Wi-Fi**.
- O app descobre sozinho o IP do computador (o mesmo que aparece no QR Code)
  e acessa o backend em `http://<ip-do-computador>:3000`
  (`mobile/src/services/config.ts`).
- Se o app não conectar, libere o Node.js / a porta 3000 no Firewall do Windows
  para redes privadas.

Telas do app:

| Tela | O que faz |
| ---- | --------- |
| Login | E-mail e senha, usando o mesmo login da API |
| Cadastro | Cria a conta de aluno e já entra no app; chega a notificação de boas-vindas (Kafka) |
| Início | Saudação, perfil do usuário e botão de sair |
| Cursos | Lista de cursos com preço; ao tocar abre o detalhe com módulos e aulas |
| Trilhas | Trilhas com os cursos na ordem recomendada; ao tocar num curso abre o detalhe |
| Detalhe do curso | Mostra o preço e leva para a tela de pagamento |
| Pagamento | Escolhe PIX, Cartão ou Boleto; a matrícula e o pagamento são gravados juntos (pagamento simulado, sem gateway) |
| Meus cursos (aluno) | Cursos em que o aluno está matriculado |
| Aulas | Assistir (abre o link do vídeo), concluir aula, barra de progresso e certificado ao chegar em 100% |
| Avisos | Notificações; o número no ícone mostra as não lidas |
| Gerenciar (Admin e Autor) | As mesmas funções de cadastro da web, uma tela por item |

No menu **Gerenciar**, o Autor vê só Cursos e Módulos e Aulas (apenas dos
próprios cursos). O Admin vê tudo: Cursos, Módulos e Aulas, Usuários,
Categorias, Trilhas, Matrículas, Progresso, Avaliações, Certificados e
Financeiro. Na tela inicial, o Admin vê o painel com os totais da plataforma.

Na web, o aluno também tem Catálogo, Meus Cursos, página do curso (compra,
aulas, progresso e certificado) e Avisos em tempo real, ou seja, qualquer
perfil pode usar a web ou o celular.

## Login

O seed cria três usuários de teste (senha `123456` para todos):

| Email             | Senha  | Perfil |
| ----------------- | ------ | ------ |
| teste@email.com   | 123456 | ADMIN  |
| ana@email.com     | 123456 | ALUNO  |
| marcos@email.com  | 123456 | AUTOR  |

## Perfis de usuário

- **ALUNO:** perfil padrão de quem se cadastra.
- **AUTOR:** cria e edita os próprios cursos, módulos e aulas.
- **ADMIN:** acessa tudo e pode mudar o perfil dos usuários na página Usuários.

O perfil vai dentro do token JWT. No backend, as rotas usam
`@Roles('ADMIN')` junto com o `RolesGuard` (`src/common/`). Na web, o menu e as
páginas mudam conforme o perfil (`podeAcessar` em `services/auth.ts`).

O login gera um token JWT que o frontend guarda no localStorage e envia no
cabeçalho `Authorization: Bearer <token>` das requisições. Todas as rotas de
POST, PUT e DELETE exigem o token, assim como a listagem de usuários. O login e
o cadastro de usuário são públicos.

No Swagger, faça o login em `POST /api/auth/login`, copie o `access_token` e
cole no botão Authorize.

## Mensageria com Kafka

O Kafka roda num container (imagem `apache/kafka`, modo KRaft, sem Zookeeper).
O próprio backend NestJS é produtor e consumidor:

- **Produtor:** `src/mensageria/mensageria.module.ts` registra o cliente `KAFKA`,
  que os services usam para publicar eventos (`this.kafka.emit(...)`).
- **Consumidor:** `src/notificacoes/notificacoes.controller.ts` escuta os tópicos
  com `@EventPattern`.
- Os tópicos (`usuario-criado`, `curso-atualizado`) são criados ao iniciar o backend.

### Notificações em tempo real

```
Cadastro de aluno          → publica "usuario-criado"   ─┐
Autor edita curso/cria aula → publica "curso-atualizado" ─┤→ Kafka → consumidor
                                                          │   grava em Notificacao (SQLite)
                                                          └─→ envia pelo WebSocket (socket.io)
                                                              → o app mostra o aviso na hora
```

- **Boas-vindas:** todo usuário novo recebe uma notificação de boas-vindas.
- **Atualizações:** quando o autor edita um curso ou cadastra uma aula (pela web),
  todos os alunos matriculados recebem um aviso. O curso também guarda a data da
  última atualização (`dataAtualizacao`), mostrada no app.
- O WebSocket (`src/notificacoes/notificacoes.gateway.ts`) usa a mesma porta da API
  e só aceita conexões com um token JWT válido.

Para ver as mensagens de um tópico direto no Kafka:

```bash
docker exec cursos-kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic usuario-criado --from-beginning
```

## Remoção de registros com dependências

As relações do banco usam `onDelete: Cascade`: ao remover um registro, os que
dependem dele são removidos junto (ex: remover uma categoria remove os cursos
dela, e remover um curso remove módulos, aulas e matrículas). O certificado
usa `SetNull` na trilha, para não ser apagado junto com ela. Erros do Prisma
que ainda aconteçam são tratados em `src/common/prisma-exception.filter.ts`.

## Estrutura

```
backend/
  prisma/            # schema, migrations e seed
  src/
    prisma/          # serviço de conexão com o banco
    auth/            # login JWT (controller, service, strategy)
    usuarios/        # CRUD de usuários (rotas protegidas)
    categorias/ cursos/ modulos/ aulas/
    matriculas/ progresso/ avaliacoes/
    trilhas/ certificados/
    planos/ assinaturas/ pagamentos/
frontend/
  src/
    components/      # Navbar, Modal, StatCard, Toasts
    models/          # interfaces TypeScript das entidades
    services/        # api.ts (cliente HTTP) e auth.ts (login/token)
    pages/           # uma página por seção (roteadas com React Router)
```
