import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

const usuarioSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class MatriculasService {
  constructor(private prisma: PrismaService) {}

  async create(createMatriculaDto: CreateMatriculaDto) {
    const jaMatriculado = await this.prisma.matricula.findFirst({
      where: {
        idUsuario: createMatriculaDto.idUsuario,
        idCurso: createMatriculaDto.idCurso,
      },
    });
    if (jaMatriculado) throw new BadRequestException('Usuário já matriculado neste curso');

    return this.prisma.matricula.create({
      data: {
        idUsuario: createMatriculaDto.idUsuario,
        idCurso: createMatriculaDto.idCurso,
      },
    });
  }

  findAll() {
    return this.prisma.matricula.findMany({
      include: { usuario: usuarioSelect, curso: true },
    });
  }

  async findOne(id: number) {
    const matricula = await this.prisma.matricula.findUnique({
      where: { id },
      include: { usuario: usuarioSelect, curso: true },
    });
    if (!matricula) throw new NotFoundException('Matrícula não encontrada');
    return matricula;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.matricula.delete({ where: { id } });
    return { mensagem: 'Matrícula removida' };
  }
}
