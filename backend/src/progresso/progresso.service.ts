import { Injectable } from '@nestjs/common';
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

  // Marca (ou atualiza) o progresso de uma aula usando upsert
  marcar(marcarProgressoDto: MarcarProgressoDto) {
    const { idUsuario, idAula } = marcarProgressoDto;
    const status = marcarProgressoDto.status || 'Concluido';

    return this.prisma.progressoAula.upsert({
      where: { idUsuario_idAula: { idUsuario, idAula } },
      update: { status, dataConclusao: new Date() },
      create: { idUsuario, idAula, status, dataConclusao: new Date() },
    });
  }

  async desmarcar(idUsuario: number, idAula: number) {
    await this.prisma.progressoAula.deleteMany({
      where: { idUsuario, idAula },
    });
    return { mensagem: 'Progresso removido' };
  }
}
