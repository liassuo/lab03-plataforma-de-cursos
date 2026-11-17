import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { UsuarioLogado } from '../common/roles.decorator';
import { verificarDonoDoCurso } from '../common/cursos.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

// Dados do instrutor sem o senhaHash
const instrutorSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class CursosService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA') private kafka: ClientKafka,
  ) {}

  create(createCursoDto: CreateCursoDto, usuario: UsuarioLogado) {
    // O autor sempre fica como instrutor do curso que ele cria;
    // se o ADMIN não informar o instrutor, ele mesmo fica como instrutor
    const idInstrutor =
      usuario.tipo === 'AUTOR' ? usuario.userId : (createCursoDto.idInstrutor ?? usuario.userId);

    return this.prisma.curso.create({
      data: {
        titulo: createCursoDto.titulo,
        descricao: createCursoDto.descricao || '',
        idInstrutor,
        idCategoria: createCursoDto.idCategoria,
        nivel: createCursoDto.nivel || 'Iniciante',
        preco: createCursoDto.preco ?? 0,
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

  async update(id: number, updateCursoDto: UpdateCursoDto, usuario: UsuarioLogado) {
    await verificarDonoDoCurso(this.prisma, id, usuario);
    const curso = await this.prisma.curso.update({
      where: { id },
      data: {
        titulo: updateCursoDto.titulo,
        descricao: updateCursoDto.descricao,
        // O autor não pode passar o curso para outro instrutor
        idInstrutor: usuario.tipo === 'AUTOR' ? undefined : updateCursoDto.idInstrutor,
        idCategoria: updateCursoDto.idCategoria,
        nivel: updateCursoDto.nivel,
        preco: updateCursoDto.preco,
      },
    });

    // Publica no Kafka para avisar os alunos matriculados
    this.kafka.emit('curso-atualizado', {
      idCurso: curso.id,
      mensagem: `O curso "${curso.titulo}" foi atualizado.`,
    });

    return curso;
  }

  async remove(id: number, usuario: UsuarioLogado) {
    await verificarDonoDoCurso(this.prisma, id, usuario);
    await this.prisma.curso.delete({ where: { id } });
    return { mensagem: 'Curso removido' };
  }
}
