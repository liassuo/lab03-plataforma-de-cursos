import { Controller, Get, Post, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/progresso')
export class ProgressoController {
  @Get()
  listar(@Query('idUsuario') idUsuario?: string, @Query('idCurso') idCurso?: string) {
    let resultado = store.progressoAulas;

    if (idUsuario) {
      resultado = resultado.filter(p => p.idUsuario === +idUsuario);
    }

    if (idCurso) {
      const modulosDoCurso = store.modulos.filter(m => m.idCurso === +idCurso);
      const idsModulos = modulosDoCurso.map(m => m.id);
      const aulasIds = store.aulas
        .filter(a => idsModulos.includes(a.idModulo))
        .map(a => a.id);
      resultado = resultado.filter(p => aulasIds.includes(p.idAula));
    }

    return resultado;
  }

  @Get('resumo/:idUsuario/:idCurso')
  resumo(@Param('idUsuario') idUsuario: string, @Param('idCurso') idCurso: string) {
    const modulosDoCurso = store.modulos.filter(m => m.idCurso === +idCurso);
    const idsModulos = modulosDoCurso.map(m => m.id);
    const totalAulas = store.aulas.filter(a => idsModulos.includes(a.idModulo)).length;

    const aulasIds = store.aulas
      .filter(a => idsModulos.includes(a.idModulo))
      .map(a => a.id);

    const concluidas = store.progressoAulas.filter(
      p => p.idUsuario === +idUsuario && aulasIds.includes(p.idAula) && p.status === 'Concluido'
    ).length;

    const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

    return { totalAulas, concluidas, percentual };
  }

  @Post()
  marcar(@Body() dados: any) {
    const existente = store.progressoAulas.find(
      p => p.idUsuario === +dados.idUsuario && p.idAula === +dados.idAula
    );

    if (existente) {
      existente.status = dados.status || 'Concluido';
      existente.dataConclusao = new Date().toISOString().split('T')[0];
      return existente;
    }

    const novo = {
      idUsuario: +dados.idUsuario,
      idAula: +dados.idAula,
      dataConclusao: new Date().toISOString().split('T')[0],
      status: dados.status || 'Concluido',
    };
    store.progressoAulas.push(novo);
    return novo;
  }

  @Delete(':idUsuario/:idAula')
  desmarcar(@Param('idUsuario') idUsuario: string, @Param('idAula') idAula: string) {
    const idx = store.progressoAulas.findIndex(
      p => p.idUsuario === +idUsuario && p.idAula === +idAula
    );
    if (idx !== -1) store.progressoAulas.splice(idx, 1);
    return { mensagem: 'Progresso removido' };
  }
}
