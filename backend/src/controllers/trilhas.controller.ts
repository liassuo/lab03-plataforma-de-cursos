import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/trilhas')
export class TrilhasController {
  @Get()
  listar() {
    return store.trilhas.map(t => ({
      ...t,
      categoria: store.categorias.find(c => c.id === t.idCategoria),
      cursos: this.buscarCursosDaTrilha(t.id),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const trilha = store.trilhas.find(t => t.id === +id);
    if (!trilha) throw new HttpException('Trilha não encontrada', HttpStatus.NOT_FOUND);
    return {
      ...trilha,
      categoria: store.categorias.find(c => c.id === trilha.idCategoria),
      cursos: this.buscarCursosDaTrilha(trilha.id),
    };
  }

  @Post()
  criar(@Body() dados: any) {
    const nova = {
      id: store.proximoId('trilhas'),
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      idCategoria: +dados.idCategoria,
    };
    store.trilhas.push(nova);
    return nova;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const trilha = store.trilhas.find(t => t.id === +id);
    if (!trilha) throw new HttpException('Trilha não encontrada', HttpStatus.NOT_FOUND);

    if (dados.titulo) trilha.titulo = dados.titulo;
    if (dados.descricao !== undefined) trilha.descricao = dados.descricao;
    if (dados.idCategoria) trilha.idCategoria = +dados.idCategoria;
    return trilha;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.trilhas.findIndex(t => t.id === +id);
    if (idx === -1) throw new HttpException('Trilha não encontrada', HttpStatus.NOT_FOUND);

    store.trilhasCursos = store.trilhasCursos.filter(tc => tc.idTrilha !== +id);
    store.trilhas.splice(idx, 1);
    return { mensagem: 'Trilha removida' };
  }

  @Post(':id/cursos')
  adicionarCurso(@Param('id') id: string, @Body() dados: any) {
    const jaExiste = store.trilhasCursos.find(
      tc => tc.idTrilha === +id && tc.idCurso === +dados.idCurso
    );
    if (jaExiste) throw new HttpException('Curso já está na trilha', HttpStatus.BAD_REQUEST);

    const cursosDaTrilha = store.trilhasCursos.filter(tc => tc.idTrilha === +id);
    const proximaOrdem = cursosDaTrilha.length > 0
      ? Math.max(...cursosDaTrilha.map(tc => tc.ordem)) + 1
      : 1;

    const vinculo = {
      idTrilha: +id,
      idCurso: +dados.idCurso,
      ordem: dados.ordem ? +dados.ordem : proximaOrdem,
    };
    store.trilhasCursos.push(vinculo);
    return vinculo;
  }

  @Delete(':id/cursos/:idCurso')
  removerCurso(@Param('id') id: string, @Param('idCurso') idCurso: string) {
    const idx = store.trilhasCursos.findIndex(
      tc => tc.idTrilha === +id && tc.idCurso === +idCurso
    );
    if (idx !== -1) store.trilhasCursos.splice(idx, 1);
    return { mensagem: 'Curso removido da trilha' };
  }

  private buscarCursosDaTrilha(idTrilha: number) {
    return store.trilhasCursos
      .filter(tc => tc.idTrilha === idTrilha)
      .sort((a, b) => a.ordem - b.ordem)
      .map(tc => ({
        ...tc,
        curso: store.cursos.find(c => c.id === tc.idCurso),
      }));
  }
}
