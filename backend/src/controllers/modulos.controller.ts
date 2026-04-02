import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/modulos')
export class ModulosController {
  @Get()
  listar() {
    return store.modulos.map(m => ({
      ...m,
      curso: store.cursos.find(c => c.id === m.idCurso),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const modulo = store.modulos.find(m => m.id === +id);
    if (!modulo) throw new HttpException('Módulo não encontrado', HttpStatus.NOT_FOUND);

    const aulas = store.aulas
      .filter(a => a.idModulo === modulo.id)
      .sort((a, b) => a.ordem - b.ordem);

    return { ...modulo, aulas };
  }

  @Post()
  criar(@Body() dados: any) {
    const modulosDoCurso = store.modulos.filter(m => m.idCurso === +dados.idCurso);
    const proximaOrdem = modulosDoCurso.length > 0
      ? Math.max(...modulosDoCurso.map(m => m.ordem)) + 1
      : 1;

    const novo = {
      id: store.proximoId('modulos'),
      idCurso: +dados.idCurso,
      titulo: dados.titulo,
      ordem: dados.ordem ? +dados.ordem : proximaOrdem,
    };
    store.modulos.push(novo);
    return novo;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const modulo = store.modulos.find(m => m.id === +id);
    if (!modulo) throw new HttpException('Módulo não encontrado', HttpStatus.NOT_FOUND);

    if (dados.titulo) modulo.titulo = dados.titulo;
    if (dados.ordem) modulo.ordem = +dados.ordem;
    return modulo;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.modulos.findIndex(m => m.id === +id);
    if (idx === -1) throw new HttpException('Módulo não encontrado', HttpStatus.NOT_FOUND);

    store.aulas = store.aulas.filter(a => a.idModulo !== +id);
    store.modulos.splice(idx, 1);
    return { mensagem: 'Módulo removido' };
  }
}
