import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/pagamentos')
export class PagamentosController {
  @Get()
  listar() {
    return store.pagamentos.map(p => ({
      ...p,
      assinatura: store.assinaturas.find(a => a.id === p.idAssinatura),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const pagamento = store.pagamentos.find(p => p.id === +id);
    if (!pagamento) throw new HttpException('Pagamento não encontrado', HttpStatus.NOT_FOUND);
    return pagamento;
  }

  @Post()
  criar(@Body() dados: any) {
    const assinatura = store.assinaturas.find(a => a.id === +dados.idAssinatura);
    if (!assinatura) throw new HttpException('Assinatura não encontrada', HttpStatus.BAD_REQUEST);

    const plano = store.planos.find(p => p.id === assinatura.idPlano);
    const transacaoId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const novo = {
      id: store.proximoId('pagamentos'),
      idAssinatura: +dados.idAssinatura,
      valorPago: plano ? plano.preco : +dados.valorPago,
      dataPagamento: new Date().toISOString().split('T')[0],
      metodoPagamento: dados.metodoPagamento || 'Cartão de Crédito',
      idTransacaoGateway: transacaoId,
    };
    store.pagamentos.push(novo);
    return novo;
  }
}
