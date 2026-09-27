import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@ApiTags('cursos')
@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos (com categoria e instrutor)' })
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um curso pelo ID (com módulos e aulas)' })
  findOne(@Param('id') id: string) {
    return this.cursosService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo curso' })
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursosService.create(createCursoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um curso' })
  update(@Param('id') id: string, @Body() updateCursoDto: UpdateCursoDto) {
    return this.cursosService.update(+id, updateCursoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um curso' })
  remove(@Param('id') id: string) {
    return this.cursosService.remove(+id);
  }
}
