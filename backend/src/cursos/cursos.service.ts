import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

// Dados do instrutor sem o senhaHash
const instrutorSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  create(createCursoDto: CreateCursoDto) {
    return this.prisma.curso.create({
      data: {
        titulo: createCursoDto.titulo,
        descricao: createCursoDto.descricao || '',
        idInstrutor: createCursoDto.idInstrutor,
        idCategoria: createCursoDto.idCategoria,
        nivel: createCursoDto.nivel || 'Iniciante',
      },
    });
  }

  findAll() {
    return this.prisma.curso.findMany({
      include: {
        categoria: true,
        instrutor: instrutorSelect,
      },
    });
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        categoria: true,
        instrutor: instrutorSelect,
        modulos: {
          orderBy: { ordem: 'asc' },
          include: {
            aulas: { orderBy: { ordem: 'asc' } },
          },
        },
      },
    });
    if (!curso) throw new NotFoundException('Curso não encontrado');
    return curso;
  }

  async update(id: number, updateCursoDto: UpdateCursoDto) {
    await this.findOne(id);
    return this.prisma.curso.update({
      where: { id },
      data: {
        titulo: updateCursoDto.titulo,
        descricao: updateCursoDto.descricao,
        idInstrutor: updateCursoDto.idInstrutor,
        idCategoria: updateCursoDto.idCategoria,
        nivel: updateCursoDto.nivel,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.curso.delete({ where: { id } });
    return { mensagem: 'Curso removido' };
  }
}
