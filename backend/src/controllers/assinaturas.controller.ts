import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/assinaturas')
export class AssinaturasController {
  @Get()
  listar() {
    return store.assinaturas.map(a => ({
      ...a,
      usuario: store.usuarios.find(u => u.id === a.idUsuario),
      plano: store.planos.find(p => p.id === a.idPlano),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const assinatura = store.assinaturas.find(a => a.id === +id);
    if (!assinatura) throw new HttpException('Assinatura não encontrada', HttpStatus.NOT_FOUND);
    return {
      ...assinatura,
      usuario: store.usuarios.find(u => u.id === assinatura.idUsuario),
      plano: store.planos.find(p => p.id === assinatura.idPlano),
    };
  }

  @Post()
  criar(@Body() dados: any) {
    const plano = store.planos.find(p => p.id === +dados.idPlano);
    if (!plano) throw new HttpException('Plano não encontrado', HttpStatus.BAD_REQUEST);

    const dataInicio = new Date();
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + plano.duracaoMeses);

    const nova = {
      id: store.proximoId('assinaturas'),
      idUsuario: +dados.idUsuario,
      idPlano: +dados.idPlano,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0],
      status: 'Ativa',
    };
    store.assinaturas.push(nova);
    return nova;
  }
}
