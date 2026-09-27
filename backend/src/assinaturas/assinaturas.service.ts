import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';

const usuarioSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class AssinaturasService {
  constructor(private prisma: PrismaService) {}

  async create(createAssinaturaDto: CreateAssinaturaDto) {
    const plano = await this.prisma.plano.findUnique({
      where: { id: createAssinaturaDto.idPlano },
    });
    if (!plano) throw new BadRequestException('Plano não encontrado');

    // A data de fim é calculada a partir da duração do plano
    const dataInicio = new Date();
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + plano.duracaoMeses);

    return this.prisma.assinatura.create({
      data: {
        idUsuario: createAssinaturaDto.idUsuario,
        idPlano: createAssinaturaDto.idPlano,
        dataInicio,
        dataFim,
      },
    });
  }

  findAll() {
    return this.prisma.assinatura.findMany({
      include: { usuario: usuarioSelect, plano: true },
    });
  }

  async findOne(id: number) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { id },
      include: { usuario: usuarioSelect, plano: true },
    });
    if (!assinatura) throw new NotFoundException('Assinatura não encontrada');
    return assinatura;
  }
}
