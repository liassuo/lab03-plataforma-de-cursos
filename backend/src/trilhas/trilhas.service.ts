import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { AddCursoTrilhaDto } from './dto/add-curso-trilha.dto';

// Include padrão: categoria + cursos da trilha em ordem
const trilhaInclude = {
  categoria: true,
  cursos: {
    orderBy: { ordem: 'asc' as const },
    include: { curso: true },
  },
};

@Injectable()
export class TrilhasService {
  constructor(private prisma: PrismaService) {}

  create(createTrilhaDto: CreateTrilhaDto) {
    return this.prisma.trilha.create({
      data: {
        titulo: createTrilhaDto.titulo,
        descricao: createTrilhaDto.descricao || '',
        idCategoria: createTrilhaDto.idCategoria,
      },
    });
  }

  findAll() {
    return this.prisma.trilha.findMany({ include: trilhaInclude });
  }

  async findOne(id: number) {
    const trilha = await this.prisma.trilha.findUnique({
      where: { id },
      include: trilhaInclude,
    });
    if (!trilha) throw new NotFoundException('Trilha não encontrada');
    return trilha;
  }

  async update(id: number, updateTrilhaDto: UpdateTrilhaDto) {
    await this.findOne(id);
    return this.prisma.trilha.update({
      where: { id },
      data: {
        titulo: updateTrilhaDto.titulo,
        descricao: updateTrilhaDto.descricao,
        idCategoria: updateTrilhaDto.idCategoria,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.trilha.delete({ where: { id } });
    return { mensagem: 'Trilha removida' };
  }

  async adicionarCurso(idTrilha: number, addCursoTrilhaDto: AddCursoTrilhaDto) {
    const jaExiste = await this.prisma.trilhaCurso.findUnique({
      where: { idTrilha_idCurso: { idTrilha, idCurso: addCursoTrilhaDto.idCurso } },
    });
    if (jaExiste) throw new BadRequestException('Curso já está na trilha');

    let ordem = addCursoTrilhaDto.ordem;
    if (!ordem) {
      const ultimo = await this.prisma.trilhaCurso.findFirst({
        where: { idTrilha },
        orderBy: { ordem: 'desc' },
      });
      ordem = ultimo ? ultimo.ordem + 1 : 1;
    }

    return this.prisma.trilhaCurso.create({
      data: { idTrilha, idCurso: addCursoTrilhaDto.idCurso, ordem },
    });
  }

  async removerCurso(idTrilha: number, idCurso: number) {
    await this.prisma.trilhaCurso.deleteMany({
      where: { idTrilha, idCurso },
    });
    return { mensagem: 'Curso removido da trilha' };
  }
}
