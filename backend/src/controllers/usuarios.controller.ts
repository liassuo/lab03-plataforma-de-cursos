import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/usuarios')
export class UsuariosController {
  @Get()
  listar() {
    return store.usuarios.map(u => {
      const { senhaHash, ...semSenha } = u;
      return semSenha;
    });
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const usuario = store.usuarios.find(u => u.id === +id);
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    const { senhaHash, ...semSenha } = usuario;
    return semSenha;
  }

  @Post()
  criar(@Body() dados: any) {
    const emailExiste = store.usuarios.find(u => u.email === dados.email);
    if (emailExiste) throw new HttpException('Email já cadastrado', HttpStatus.BAD_REQUEST);

    const novo = {
      id: store.proximoId('usuarios'),
      nomeCompleto: dados.nomeCompleto,
      email: dados.email,
      senhaHash: dados.senha || 'hash_simulado',
      dataCadastro: new Date().toISOString().split('T')[0],
    };
    store.usuarios.push(novo);

    const { senhaHash, ...semSenha } = novo;
    return semSenha;
  }

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: any) {
    const usuario = store.usuarios.find(u => u.id === +id);
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    if (dados.nomeCompleto) usuario.nomeCompleto = dados.nomeCompleto;
    if (dados.email) usuario.email = dados.email;

    const { senhaHash, ...semSenha } = usuario;
    return semSenha;
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    const idx = store.usuarios.findIndex(u => u.id === +id);
    if (idx === -1) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    store.usuarios.splice(idx, 1);
    return { mensagem: 'Usuário removido' };
  }
}
