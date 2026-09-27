import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulasService {
  constructor(private prisma: PrismaService) {}

  async create(createAulaDto: CreateAulaDto) {
    let ordem = createAulaDto.ordem;

    if (!ordem) {
      const ultima = await this.prisma.aula.findFirst({
        where: { idModulo: createAulaDto.idModulo },
        orderBy: { ordem: 'desc' },
      });
      ordem = ultima ? ultima.ordem + 1 : 1;
    }

    const aula = await this.prisma.aula.create({
      data: {
        idModulo: createAulaDto.idModulo,
        titulo: createAulaDto.titulo,
        tipoConteudo: createAulaDto.tipoConteudo || 'Video',
        urlConteudo: createAulaDto.urlConteudo || '',
        duracaoMinutos: createAulaDto.duracaoMinutos,
        ordem,
      },
    });

    await this.recalcularTotaisCurso(aula.idModulo);
    return aula;
  }

  findAll() {
    return this.prisma.aula.findMany({ include: { modulo: true } });
  }

  async findOne(id: number) {
    const aula = await this.prisma.aula.findUnique({ where: { id } });
    if (!aula) throw new NotFoundException('Aula não encontrada');
    return aula;
  }

  async update(id: number, updateAulaDto: UpdateAulaDto) {
    await this.findOne(id);
    const aula = await this.prisma.aula.update({
      where: { id },
      data: {
        titulo: updateAulaDto.titulo,
        tipoConteudo: updateAulaDto.tipoConteudo,
        urlConteudo: updateAulaDto.urlConteudo,
        duracaoMinutos: updateAulaDto.duracaoMinutos,
        ordem: updateAulaDto.ordem,
      },
    });
    await this.recalcularTotaisCurso(aula.idModulo);
    return aula;
  }

  async remove(id: number) {
    const aula = await this.findOne(id);
    await this.prisma.aula.delete({ where: { id } });
    await this.recalcularTotaisCurso(aula.idModulo);
    return { mensagem: 'Aula removida' };
  }

  // Mantém os campos totalAulas e totalHoras do curso atualizados
  private async recalcularTotaisCurso(idModulo: number) {
    const modulo = await this.prisma.modulo.findUnique({ where: { id: idModulo } });
    if (!modulo) return;

    const aulas = await this.prisma.aula.findMany({
      where: { modulo: { idCurso: modulo.idCurso } },
    });

    const totalMinutos = aulas.reduce((acc, a) => acc + a.duracaoMinutos, 0);

    await this.prisma.curso.update({
      where: { id: modulo.idCurso },
      data: {
        totalAulas: aulas.length,
        totalHoras: Math.round((totalMinutos / 60) * 10) / 10,
      },
    });
  }
}
