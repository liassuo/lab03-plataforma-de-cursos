import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/categorias')
export class CategoriasController {
  @Get()
  listar() {
    return store.categorias;
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const categoria = store.categorias.find(c => c.id === +id);
    if (!categoria) throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);
    return categoria;
  }

  @Post()
  criar(@Body() dados: any) {
    const duplicada = store.categorias.find(c => c.nome === dados.nome);
    if (duplicada) throw new HttpException('Já existe uma categoria com esse nome', HttpStatus.BAD_REQUEST);

    const nova = {
      id: store.proximoId('categorias'),
      nome: dados.nome,
      descricao: dados.descricao || '',
    };
    store.categorias.push(nova);
    return nova;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const categoria = store.categorias.find(c => c.id === +id);
    if (!categoria) throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);

    if (dados.nome) categoria.nome = dados.nome;
    if (dados.descricao !== undefined) categoria.descricao = dados.descricao;
    return categoria;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.categorias.findIndex(c => c.id === +id);
    if (idx === -1) throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);
    store.categorias.splice(idx, 1);
    return { mensagem: 'Categoria removida' };
  }
}
