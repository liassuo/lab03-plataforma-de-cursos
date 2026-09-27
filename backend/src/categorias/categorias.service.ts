import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    const duplicada = await this.prisma.categoria.findUnique({
      where: { nome: createCategoriaDto.nome },
    });
    if (duplicada) throw new BadRequestException('Já existe uma categoria com esse nome');

    return this.prisma.categoria.create({ data: createCategoriaDto });
  }

  findAll() {
    return this.prisma.categoria.findMany();
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);
    return this.prisma.categoria.update({ where: { id }, data: updateCategoriaDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.categoria.delete({ where: { id } });
    return { mensagem: 'Categoria removida' };
  }
}
