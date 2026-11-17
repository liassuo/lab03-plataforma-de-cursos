import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioLogado } from '../common/roles.decorator';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

const usuarioSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class MatriculasService {
  constructor(private prisma: PrismaService) {}

  async create(createMatriculaDto: CreateMatriculaDto, usuario: UsuarioLogado) {
    // O ADMIN pode matricular outra pessoa; o aluno sempre se matricula
    const idUsuario =
      usuario.tipo === 'ADMIN' && createMatriculaDto.idUsuario
        ? createMatriculaDto.idUsuario
        : usuario.userId;

    const curso = await this.prisma.curso.findUnique({ where: { id: createMatriculaDto.idCurso } });
    if (!curso) throw new NotFoundException('Curso não encontrado');

    const jaMatriculado = await this.prisma.matricula.findFirst({
      where: { idUsuario, idCurso: createMatriculaDto.idCurso },
    });
    if (jaMatriculado) throw new BadRequestException('Usuário já matriculado neste curso');

    // Curso pago: o aluno precisa escolher como vai pagar
    const pago = curso.preco > 0 && usuario.tipo === 'ALUNO';
    if (pago && !createMatriculaDto.metodoPagamento) {
      throw new BadRequestException('Informe o método de pagamento');
    }

    // A matrícula e o pagamento são gravados juntos: se um falhar, nenhum é salvo
    return this.prisma.matricula.create({
      data: {
        idUsuario,
        idCurso: curso.id,
        pagamentos: pago
          ? {
              create: {
                valorPago: curso.preco,
                metodoPagamento: createMatriculaDto.metodoPagamento!,
                // Simula o ID de transação que um gateway de pagamento devolveria
                idTransacaoGateway:
                  'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
              },
            }
          : undefined,
      },
      include: { pagamentos: true },
    });
  }

  findByUsuario(idUsuario: number) {
    return this.prisma.matricula.findMany({
      where: { idUsuario },
      include: { curso: { include: { categoria: true } } },
      orderBy: { dataMatricula: 'desc' },
    });
  }

  findAll() {
    return this.prisma.matricula.findMany({
      include: { usuario: usuarioSelect, curso: true, pagamentos: true },
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
