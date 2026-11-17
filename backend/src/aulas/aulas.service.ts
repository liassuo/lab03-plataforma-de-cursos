import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioLogado } from '../common/roles.decorator';
import { recalcularTotaisCurso, verificarDonoDoCurso } from '../common/cursos.helpers';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulasService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA') private kafka: ClientKafka,
  ) {}

  // Descobre de qual curso é o módulo (a aula pertence a um módulo, que pertence a um curso)
  private async buscarModulo(idModulo: number) {
    const modulo = await this.prisma.modulo.findUnique({ where: { id: idModulo } });
    if (!modulo) throw new NotFoundException('Módulo não encontrado');
    return modulo;
  }

  async create(createAulaDto: CreateAulaDto, usuario: UsuarioLogado) {
    const modulo = await this.buscarModulo(createAulaDto.idModulo);
    const curso = await verificarDonoDoCurso(this.prisma, modulo.idCurso, usuario);

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

    await recalcularTotaisCurso(this.prisma, modulo.idCurso);

    // Aula nova é uma atualização do curso: publica no Kafka para avisar os alunos
    this.kafka.emit('curso-atualizado', {
      idCurso: modulo.idCurso,
      mensagem: `Nova aula no curso "${curso.titulo}": ${aula.titulo}`,
    });

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

  async update(id: number, updateAulaDto: UpdateAulaDto, usuario: UsuarioLogado) {
    const aulaAtual = await this.findOne(id);
    const modulo = await this.buscarModulo(aulaAtual.idModulo);
    await verificarDonoDoCurso(this.prisma, modulo.idCurso, usuario);

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
    await recalcularTotaisCurso(this.prisma, modulo.idCurso);
    return aula;
  }

  async remove(id: number, usuario: UsuarioLogado) {
    const aula = await this.findOne(id);
    const modulo = await this.buscarModulo(aula.idModulo);
    await verificarDonoDoCurso(this.prisma, modulo.idCurso, usuario);

    await this.prisma.aula.delete({ where: { id } });
    await recalcularTotaisCurso(this.prisma, modulo.idCurso);
    return { mensagem: 'Aula removida' };
  }
}
