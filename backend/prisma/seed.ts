import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const totalUsuarios = await prisma.usuario.count();
  if (totalUsuarios > 0) {
    console.log('Banco já possui dados, seed ignorado.');
    return;
  }

  // Senha padrão dos usuários de teste: 123456
  const senhaHash = await bcrypt.hash('123456', 10);

  await prisma.categoria.createMany({
    data: [
      { nome: 'Desenvolvimento Web', descricao: 'Cursos de programação web front e backend' },
      { nome: 'Data Science', descricao: 'Análise de dados, machine learning e estatística' },
      { nome: 'Design', descricao: 'UI/UX, design gráfico e prototipação' },
    ],
  });

  await prisma.usuario.createMany({
    data: [
      { nomeCompleto: 'Usuário Teste', email: 'teste@email.com', senhaHash, tipo: 'ADMIN' },
      { nomeCompleto: 'Ana Souza', email: 'ana@email.com', senhaHash, tipo: 'ALUNO' },
      { nomeCompleto: 'Prof. Marcos Lima', email: 'marcos@email.com', senhaHash, tipo: 'AUTOR' },
    ],
  });

  await prisma.curso.createMany({
    data: [
      {
        titulo: 'JavaScript do Zero ao Avançado',
        descricao: 'Aprenda JS desde o básico até conceitos avançados',
        idInstrutor: 3,
        idCategoria: 1,
        nivel: 'Iniciante',
        preco: 49.9,
      },
      {
        titulo: 'Python para Data Science',
        descricao: 'Fundamentos de Python aplicados a ciência de dados',
        idInstrutor: 3,
        idCategoria: 2,
        nivel: 'Intermediário',
        preco: 79.9,
      },
    ],
  });

  await prisma.trilha.create({
    data: {
      titulo: 'Programador Iniciante',
      descricao: 'Comece pelo JavaScript e depois avance para Python',
      idCategoria: 1,
      cursos: {
        create: [
          { idCurso: 1, ordem: 1 },
          { idCurso: 2, ordem: 2 },
        ],
      },
    },
  });

  await prisma.plano.createMany({
    data: [
      { nome: 'Básico', descricao: 'Acesso a 3 cursos por mês', preco: 29.9, duracaoMeses: 1 },
      { nome: 'Pro', descricao: 'Acesso ilimitado a todos os cursos', preco: 59.9, duracaoMeses: 6 },
      { nome: 'Premium', descricao: 'Acesso ilimitado + certificados + suporte', preco: 99.9, duracaoMeses: 12 },
    ],
  });

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
