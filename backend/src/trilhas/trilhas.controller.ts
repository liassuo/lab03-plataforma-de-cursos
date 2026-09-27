import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrilhasService } from './trilhas.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { AddCursoTrilhaDto } from './dto/add-curso-trilha.dto';

@ApiTags('trilhas')
@Controller('api/trilhas')
export class TrilhasController {
  constructor(private readonly trilhasService: TrilhasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as trilhas (com cursos)' })
  findAll() {
    return this.trilhasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma trilha pelo ID' })
  findOne(@Param('id') id: string) {
    return this.trilhasService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova trilha' })
  create(@Body() createTrilhaDto: CreateTrilhaDto) {
    return this.trilhasService.create(createTrilhaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma trilha' })
  update(@Param('id') id: string, @Body() updateTrilhaDto: UpdateTrilhaDto) {
    return this.trilhasService.update(+id, updateTrilhaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma trilha' })
  remove(@Param('id') id: string) {
    return this.trilhasService.remove(+id);
  }

  @Post(':id/cursos')
  @ApiOperation({ summary: 'Adicionar um curso à trilha' })
  adicionarCurso(@Param('id') id: string, @Body() addCursoTrilhaDto: AddCursoTrilhaDto) {
    return this.trilhasService.adicionarCurso(+id, addCursoTrilhaDto);
  }

  @Delete(':id/cursos/:idCurso')
  @ApiOperation({ summary: 'Remover um curso da trilha' })
  removerCurso(@Param('id') id: string, @Param('idCurso') idCurso: string) {
    return this.trilhasService.removerCurso(+id, +idCurso);
  }
}
