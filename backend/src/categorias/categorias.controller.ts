import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@ApiTags('categorias')
@Controller('api/categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma categoria pelo ID' })
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova categoria' })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma categoria' })
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriasService.update(+id, updateCategoriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma categoria' })
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(+id);
  }
}
