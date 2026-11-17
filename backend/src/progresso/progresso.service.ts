import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioLogado } from '../common/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { MarcarProgressoDto } from './dto/marcar-progresso.dto';

@Injectable()
export class ProgressoService {
  constructor(private prisma: PrismaService) {}

  findAll(idUsuario?: number, idCurso?: number) {
    return this.prisma.progressoAula.findMany({
      where: {
        idUsuario: idUsuario || undefined,
        // Filtra pelas aulas que pertencem aos módulos do curso
        aula: idCurso ? { modulo: { idCurso } } : undefined,
      },
    });
  }

  // Resumo do progresso de um aluno em um curso (percentual de conclusão)
  async resumo(idUsuario: number, idCurso: number) {
    const totalAulas = await this.prisma.aula.count({
      where: { modulo: { idCurso } },
    });

    const concluidas = await this.prisma.progressoAula.count({
      where: {
        idUsuario,
        status: 'Concluido',
        aula: { modulo: { idCurso } },
      },
    });

    const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

    return { totalAulas, concluidas, percentual };
  }

  // Progresso do aluno logado: usado pelo app para marcar as aulas já vistas
  async meu(idUsuario: number, idCurso: number) {
    const concluidas = await this.prisma.progressoAula.findMany({
      where: { idUsuario, status: 'Concluido', aula: { modulo: { idCurso } } },
      select: { idAula: true },
    });
    const resumo = await this.resumo(idUsuario, idCurso);
    return { ...resumo, aulasConcluidas: concluidas.map((p) => p.idAula) };
  }

  // Marca (ou atualiza) o progresso de uma aula usando upsert
  async marcar(marcarProgressoDto: MarcarProgressoDto, usuario: UsuarioLogado) {
    const { idAula } = marcarProgressoDto;
    // O ADMIN pode marcar para outro aluno; os demais marcam para si mesmos
    const idUsuario =
      usuario.tipo === 'ADMIN' && marcarProgressoDto.idUsuario
        ? marcarProgressoDto.idUsuario
        : usuario.userId;
    const status = marcarProgressoDto.status || 'Concluido';

    const aula = await this.prisma.aula.findUnique({ where: { id: idAula }, include: { modulo: true } });
    if (!aula) throw new NotFoundException('Aula não encontrada');
    const idCurso = aula.modulo.idCurso;

    // Só quem comprou o curso pode assistir às aulas
    const matricula = await this.prisma.matricula.findFirst({ where: { idUsuario, idCurso } });
    if (!matricula) throw new ForbiddenException('Você não está matriculado neste curso');

    const progresso = await this.prisma.progressoAula.upsert({
      where: { idUsuario_idAula: { idUsuario, idAula } },
      update: { status, dataConclusao: new Date() },
      create: { idUsuario, idAula, status, dataConclusao: new Date() },
    });

    // Concluiu todas as aulas: registra a conclusão do curso na matrícula
    const resumo = await this.resumo(idUsuario, idCurso);
    if (resumo.percentual === 100 && !matricula.dataConclusao) {
      await this.prisma.matricula.update({
        where: { id: matricula.id },
        data: { dataConclusao: new Date() },
      });
    }

    return progresso;
  }

  async desmarcar(idUsuario: number, idAula: number) {
    await this.prisma.progressoAula.deleteMany({
      where: { idUsuario, idAula },
    });
    return { mensagem: 'Progresso removido' };
  }
}
