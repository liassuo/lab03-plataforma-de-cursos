import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@Injectable()
export class PlanosService {
  constructor(private prisma: PrismaService) {}

  create(createPlanoDto: CreatePlanoDto) {
    return this.prisma.plano.create({
      data: {
        nome: createPlanoDto.nome,
        descricao: createPlanoDto.descricao || '',
        preco: createPlanoDto.preco,
        duracaoMeses: createPlanoDto.duracaoMeses,
      },
    });
  }

  findAll() {
    return this.prisma.plano.findMany();
  }

  async findOne(id: number) {
    const plano = await this.prisma.plano.findUnique({ where: { id } });
    if (!plano) throw new NotFoundException('Plano não encontrado');
    return plano;
  }

  async update(id: number, updatePlanoDto: UpdatePlanoDto) {
    await this.findOne(id);
    return this.prisma.plano.update({ where: { id }, data: updatePlanoDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.plano.delete({ where: { id } });
    return { mensagem: 'Plano removido' };
  }
}
