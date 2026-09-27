import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@ApiTags('modulos')
@Controller('api/modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os módulos' })
  findAll() {
    return this.modulosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um módulo pelo ID (com aulas)' })
  findOne(@Param('id') id: string) {
    return this.modulosService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo módulo em um curso' })
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.modulosService.create(createModuloDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.modulosService.update(+id, updateModuloDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um módulo (e suas aulas)' })
  remove(@Param('id') id: string) {
    return this.modulosService.remove(+id);
  }
}
