import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// Select padrão para nunca devolver o senhaHash nas respostas
const usuarioSemSenha = {
  id: true,
  nomeCompleto: true,
  email: true,
  dataCadastro: true,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const emailExiste = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email },
    });
    if (emailExiste) throw new BadRequestException('Email já cadastrado');

    // Gera o hash da senha antes de salvar no banco
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, 10);

    return this.prisma.usuario.create({
      data: {
        nomeCompleto: createUsuarioDto.nomeCompleto,
        email: createUsuarioDto.email,
        senhaHash,
      },
      select: usuarioSemSenha,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({ select: usuarioSemSenha });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioSemSenha,
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  // Usado no login: aqui precisamos do senhaHash para comparar
  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: {
        nomeCompleto: updateUsuarioDto.nomeCompleto,
        email: updateUsuarioDto.email,
      },
      select: usuarioSemSenha,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.usuario.delete({ where: { id } });
    return { mensagem: 'Usuário removido' };
  }
}
