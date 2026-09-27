import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

const usuarioSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  async create(createAvaliacaoDto: CreateAvaliacaoDto) {
    const jaAvaliou = await this.prisma.avaliacao.findFirst({
      where: {
        idUsuario: createAvaliacaoDto.idUsuario,
        idCurso: createAvaliacaoDto.idCurso,
      },
    });
    if (jaAvaliou) throw new BadRequestException('Usuário já avaliou este curso');

    return this.prisma.avaliacao.create({
      data: {
        idUsuario: createAvaliacaoDto.idUsuario,
        idCurso: createAvaliacaoDto.idCurso,
        nota: createAvaliacaoDto.nota,
        comentario: createAvaliacaoDto.comentario || null,
      },
    });
  }

  findAll() {
    return this.prisma.avaliacao.findMany({
      include: { usuario: usuarioSelect, curso: true },
    });
  }

  async remove(id: number) {
    const avaliacao = await this.prisma.avaliacao.findUnique({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');

    await this.prisma.avaliacao.delete({ where: { id } });
    return { mensagem: 'Avaliação removida' };
  }
}
