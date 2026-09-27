# LAB03 - Plataforma de Cursos Online

Sistema de gerenciamento de uma plataforma de cursos online com backend em NestJS
e frontend em HTML + Bootstrap 5 + JavaScript.

## Tecnologias

- **Backend:** NestJS, Prisma ORM, SQLite, JWT (Passport), bcrypt, Swagger
- **Frontend:** HTML5, Bootstrap 5, JavaScript (fetch API)

## Como rodar

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

Basta servir a pasta `frontend` com qualquer servidor estático, por exemplo:

```bash
cd frontend
npx http-server -p 5500
```

E acessar `http://localhost:5500`.

## Login

O seed cria três usuários de teste (senha `123456` para todos):

| Email             | Senha  |
| ----------------- | ------ |
| teste@email.com   | 123456 |
| ana@email.com     | 123456 |
| marcos@email.com  | 123456 |

O login gera um token JWT que o frontend guarda no localStorage e envia no
cabeçalho `Authorization: Bearer <token>` das requisições. As rotas de listagem,
atualização e remoção de usuários exigem o token (o cadastro é público).

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
  index.html
  js/                # api.js (cliente HTTP), auth.js (login), telas
  css/
```
