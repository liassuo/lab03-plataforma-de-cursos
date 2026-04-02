import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/cursos')
export class CursosController {
  @Get()
  listar() {
    return store.cursos.map(curso => ({
      ...curso,
      categoria: store.categorias.find(c => c.id === curso.idCategoria),
      instrutor: store.usuarios.find(u => u.id === curso.idInstrutor),
    }));
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const curso = store.cursos.find(c => c.id === +id);
    if (!curso) throw new HttpException('Curso não encontrado', HttpStatus.NOT_FOUND);

    const modulos = store.modulos
      .filter(m => m.idCurso === curso.id)
      .sort((a, b) => a.ordem - b.ordem)
      .map(modulo => ({
        ...modulo,
        aulas: store.aulas
          .filter(a => a.idModulo === modulo.id)
          .sort((a, b) => a.ordem - b.ordem),
      }));

    return {
      ...curso,
      categoria: store.categorias.find(c => c.id === curso.idCategoria),
      instrutor: store.usuarios.find(u => u.id === curso.idInstrutor),
      modulos,
    };
  }

  @Post()
  criar(@Body() dados: any) {
    const novo = {
      id: store.proximoId('cursos'),
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      idInstrutor: +dados.idInstrutor,
      idCategoria: +dados.idCategoria,
      nivel: dados.nivel || 'Iniciante',
      dataPublicacao: dados.dataPublicacao || new Date().toISOString().split('T')[0],
      totalAulas: 0,
      totalHoras: 0,
    };
    store.cursos.push(novo);
    return novo;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const curso = store.cursos.find(c => c.id === +id);
    if (!curso) throw new HttpException('Curso não encontrado', HttpStatus.NOT_FOUND);

    Object.assign(curso, {
      titulo: dados.titulo ?? curso.titulo,
      descricao: dados.descricao ?? curso.descricao,
      idInstrutor: dados.idInstrutor ? +dados.idInstrutor : curso.idInstrutor,
      idCategoria: dados.idCategoria ? +dados.idCategoria : curso.idCategoria,
      nivel: dados.nivel ?? curso.nivel,
    });
    return curso;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.cursos.findIndex(c => c.id === +id);
    if (idx === -1) throw new HttpException('Curso não encontrado', HttpStatus.NOT_FOUND);
    store.cursos.splice(idx, 1);
    return { mensagem: 'Curso removido' };
  }
}
