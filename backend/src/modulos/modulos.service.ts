import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  async create(createModuloDto: CreateModuloDto) {
    let ordem = createModuloDto.ordem;

    // Se a ordem não for informada, coloca no final da fila
    if (!ordem) {
      const ultimo = await this.prisma.modulo.findFirst({
        where: { idCurso: createModuloDto.idCurso },
        orderBy: { ordem: 'desc' },
      });
      ordem = ultimo ? ultimo.ordem + 1 : 1;
    }

    return this.prisma.modulo.create({
      data: {
        idCurso: createModuloDto.idCurso,
        titulo: createModuloDto.titulo,
        ordem,
      },
    });
  }

  findAll() {
    return this.prisma.modulo.findMany({ include: { curso: true } });
  }

  async findOne(id: number) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id },
      include: { aulas: { orderBy: { ordem: 'asc' } } },
    });
    if (!modulo) throw new NotFoundException('Módulo não encontrado');
    return modulo;
  }

  async update(id: number, updateModuloDto: UpdateModuloDto) {
    await this.findOne(id);
    return this.prisma.modulo.update({
      where: { id },
      data: {
        titulo: updateModuloDto.titulo,
        ordem: updateModuloDto.ordem,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // As aulas do módulo são removidas em cascata (onDelete: Cascade no schema)
    await this.prisma.modulo.delete({ where: { id } });
    return { mensagem: 'Módulo removido' };
  }
}
