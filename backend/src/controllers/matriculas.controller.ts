import { Controller, Get, Post, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/matriculas')
export class MatriculasController {
  @Get()
  listar() {
    return store.matriculas.map(m => ({
      ...m,
      usuario: store.usuarios.find(u => u.id === m.idUsuario),
      curso: store.cursos.find(c => c.id === m.idCurso),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const matricula = store.matriculas.find(m => m.id === +id);
    if (!matricula) throw new HttpException('Matrícula não encontrada', HttpStatus.NOT_FOUND);
    return {
      ...matricula,
      usuario: store.usuarios.find(u => u.id === matricula.idUsuario),
      curso: store.cursos.find(c => c.id === matricula.idCurso),
    };
  }

  @Post()
  criar(@Body() dados: any) {
    const jaMatriculado = store.matriculas.find(
      m => m.idUsuario === +dados.idUsuario && m.idCurso === +dados.idCurso
    );
    if (jaMatriculado) throw new HttpException('Usuário já matriculado neste curso', HttpStatus.BAD_REQUEST);

    const nova = {
      id: store.proximoId('matriculas'),
      idUsuario: +dados.idUsuario,
      idCurso: +dados.idCurso,
      dataMatricula: new Date().toISOString().split('T')[0],
      dataConclusao: null,
    };
    store.matriculas.push(nova);
    return nova;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.matriculas.findIndex(m => m.id === +id);
    if (idx === -1) throw new HttpException('Matrícula não encontrada', HttpStatus.NOT_FOUND);
    store.matriculas.splice(idx, 1);
    return { mensagem: 'Matrícula removida' };
  }
}
