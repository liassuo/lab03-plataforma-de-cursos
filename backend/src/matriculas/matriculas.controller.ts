import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@ApiTags('matriculas')
@Controller('api/matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas' })
  findAll() {
    return this.matriculasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID' })
  findOne(@Param('id') id: string) {
    return this.matriculasService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Matricular um usuário em um curso' })
  create(@Body() createMatriculaDto: CreateMatriculaDto) {
    return this.matriculasService.create(createMatriculaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  remove(@Param('id') id: string) {
    return this.matriculasService.remove(+id);
  }
}
