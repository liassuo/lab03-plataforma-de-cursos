import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// Select padrão para nunca devolver o senhaHash nas respostas
const usuarioSemSenha = {
  id: true,
  nomeCompleto: true,
  email: true,
  tipo: true,
  dataCadastro: true,
};

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA') private kafka: ClientKafka,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const emailExiste = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email },
    });
    if (emailExiste) throw new BadRequestException('Email já cadastrado');

    // Gera o hash da senha antes de salvar no banco
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nomeCompleto: createUsuarioDto.nomeCompleto,
        email: createUsuarioDto.email,
        senhaHash,
      },
      select: usuarioSemSenha,
    });

    // Publica o evento no Kafka; o consumidor cria a mensagem de boas-vindas
    this.kafka.emit('usuario-criado', {
      id: usuario.id,
      nomeCompleto: usuario.nomeCompleto,
      email: usuario.email,
    });

    return usuario;
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
        tipo: updateUsuarioDto.tipo,
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
