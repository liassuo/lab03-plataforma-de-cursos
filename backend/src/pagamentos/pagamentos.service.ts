import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  async create(createPagamentoDto: CreatePagamentoDto) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { id: createPagamentoDto.idAssinatura },
      include: { plano: true },
    });
    if (!assinatura) throw new BadRequestException('Assinatura não encontrada');

    // Simula o ID de transação que um gateway de pagamento devolveria
    const idTransacaoGateway =
      'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    return this.prisma.pagamento.create({
      data: {
        idAssinatura: assinatura.id,
        valorPago: assinatura.plano.preco,
        metodoPagamento: createPagamentoDto.metodoPagamento || 'Cartão de Crédito',
        idTransacaoGateway,
      },
    });
  }

  findAll() {
    return this.prisma.pagamento.findMany({
      include: { assinatura: true },
    });
  }

  async findOne(id: number) {
    const pagamento = await this.prisma.pagamento.findUnique({ where: { id } });
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');
    return pagamento;
  }
}
