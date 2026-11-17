import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioLogado } from './roles.decorator';

// O AUTOR só pode mexer nos próprios cursos (e nos módulos e aulas deles).
// O ADMIN pode mexer em todos.
export async function verificarDonoDoCurso(
  prisma: PrismaService,
  idCurso: number,
  usuario: UsuarioLogado,
) {
  const curso = await prisma.curso.findUnique({ where: { id: idCurso } });
  if (!curso) throw new NotFoundException('Curso não encontrado');

  if (usuario.tipo === 'AUTOR' && curso.idInstrutor !== usuario.userId) {
    throw new ForbiddenException('Você só pode alterar os seus próprios cursos');
  }
  return curso;
}

// Mantém os campos totalAulas e totalHoras do curso atualizados.
// Chamado sempre que uma aula ou um módulo é criado, alterado ou removido.
export async function recalcularTotaisCurso(prisma: PrismaService, idCurso: number) {
  const aulas = await prisma.aula.findMany({ where: { modulo: { idCurso } } });
  const totalMinutos = aulas.reduce((total, aula) => total + aula.duracaoMinutos, 0);

  await prisma.curso.update({
    where: { id: idCurso },
    data: {
      totalAulas: aulas.length,
      totalHoras: Math.round((totalMinutos / 60) * 10) / 10,
    },
  });
}
