import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AulasService } from './aulas.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@ApiTags('aulas')
@Controller('api/aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as aulas' })
  findAll() {
    return this.aulasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma aula pelo ID' })
  findOne(@Param('id') id: string) {
    return this.aulasService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova aula em um módulo' })
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulasService.create(createAulaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma aula' })
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    return this.aulasService.update(+id, updateAulaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma aula' })
  remove(@Param('id') id: string) {
    return this.aulasService.remove(+id);
  }
}
