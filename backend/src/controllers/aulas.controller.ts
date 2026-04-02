import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/aulas')
export class AulasController {
  @Get()
  listar() {
    return store.aulas.map(a => ({
      ...a,
      modulo: store.modulos.find(m => m.id === a.idModulo),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const aula = store.aulas.find(a => a.id === +id);
    if (!aula) throw new HttpException('Aula não encontrada', HttpStatus.NOT_FOUND);
    return aula;
  }

  @Post()
  criar(@Body() dados: any) {
    const aulasDoModulo = store.aulas.filter(a => a.idModulo === +dados.idModulo);
    const proximaOrdem = aulasDoModulo.length > 0
      ? Math.max(...aulasDoModulo.map(a => a.ordem)) + 1
      : 1;

    const nova = {
      id: store.proximoId('aulas'),
      idModulo: +dados.idModulo,
      titulo: dados.titulo,
      tipoConteudo: dados.tipoConteudo || 'Video',
      urlConteudo: dados.urlConteudo || '',
      duracaoMinutos: +dados.duracaoMinutos || 0,
      ordem: dados.ordem ? +dados.ordem : proximaOrdem,
    };
    store.aulas.push(nova);

    this.recalcularTotaisCurso(+dados.idModulo);
    return nova;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const aula = store.aulas.find(a => a.id === +id);
    if (!aula) throw new HttpException('Aula não encontrada', HttpStatus.NOT_FOUND);

    if (dados.titulo) aula.titulo = dados.titulo;
    if (dados.tipoConteudo) aula.tipoConteudo = dados.tipoConteudo;
    if (dados.urlConteudo !== undefined) aula.urlConteudo = dados.urlConteudo;
    if (dados.duracaoMinutos) aula.duracaoMinutos = +dados.duracaoMinutos;
    if (dados.ordem) aula.ordem = +dados.ordem;
    return aula;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const aula = store.aulas.find(a => a.id === +id);
    if (!aula) throw new HttpException('Aula não encontrada', HttpStatus.NOT_FOUND);

    const idModulo = aula.idModulo;
    const idx = store.aulas.indexOf(aula);
    store.aulas.splice(idx, 1);

    this.recalcularTotaisCurso(idModulo);
    return { mensagem: 'Aula removida' };
  }

  private recalcularTotaisCurso(idModulo: number) {
    const modulo = store.modulos.find(m => m.id === idModulo);
    if (!modulo) return;

    const curso = store.cursos.find(c => c.id === modulo.idCurso);
    if (!curso) return;

    const modulosDoCurso = store.modulos.filter(m => m.idCurso === curso.id);
    const idsModulos = modulosDoCurso.map(m => m.id);
    const todasAulas = store.aulas.filter(a => idsModulos.includes(a.idModulo));

    curso.totalAulas = todasAulas.length;
    curso.totalHoras = Math.round((todasAulas.reduce((acc, a) => acc + a.duracaoMinutos, 0) / 60) * 10) / 10;
  }
}
