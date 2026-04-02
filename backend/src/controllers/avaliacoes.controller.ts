import { Controller, Get, Post, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/avaliacoes')
export class AvaliacoesController {
  @Get()
  listar() {
    return store.avaliacoes.map(a => ({
      ...a,
      usuario: store.usuarios.find(u => u.id === a.idUsuario),
      curso: store.cursos.find(c => c.id === a.idCurso),
    }));
  }

  @Post()
  criar(@Body() dados: any) {
    const jaAvaliou = store.avaliacoes.find(
      a => a.idUsuario === +dados.idUsuario && a.idCurso === +dados.idCurso
    );
    if (jaAvaliou) throw new HttpException('Usuário já avaliou este curso', HttpStatus.BAD_REQUEST);

    const nova = {
      id: store.proximoId('avaliacoes'),
      idUsuario: +dados.idUsuario,
      idCurso: +dados.idCurso,
      nota: +dados.nota,
      comentario: dados.comentario || null,
      dataAvaliacao: new Date().toISOString().split('T')[0],
    };
    store.avaliacoes.push(nova);
    return nova;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.avaliacoes.findIndex(a => a.id === +id);
    if (idx === -1) throw new HttpException('Avaliação não encontrada', HttpStatus.NOT_FOUND);
    store.avaliacoes.splice(idx, 1);
    return { mensagem: 'Avaliação removida' };
  }
}
