import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/planos')
export class PlanosController {
  @Get()
  listar() {
    return store.planos;
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const plano = store.planos.find(p => p.id === +id);
    if (!plano) throw new HttpException('Plano não encontrado', HttpStatus.NOT_FOUND);
    return plano;
  }

  @Post()
  criar(@Body() dados: any) {
    const novo = {
      id: store.proximoId('planos'),
      nome: dados.nome,
      descricao: dados.descricao || '',
      preco: +dados.preco,
      duracaoMeses: +dados.duracaoMeses,
    };
    store.planos.push(novo);
    return novo;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const plano = store.planos.find(p => p.id === +id);
    if (!plano) throw new HttpException('Plano não encontrado', HttpStatus.NOT_FOUND);

    if (dados.nome) plano.nome = dados.nome;
    if (dados.descricao !== undefined) plano.descricao = dados.descricao;
    if (dados.preco) plano.preco = +dados.preco;
    if (dados.duracaoMeses) plano.duracaoMeses = +dados.duracaoMeses;
    return plano;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.planos.findIndex(p => p.id === +id);
    if (idx === -1) throw new HttpException('Plano não encontrado', HttpStatus.NOT_FOUND);
    store.planos.splice(idx, 1);
    return { mensagem: 'Plano removido' };
  }
}
