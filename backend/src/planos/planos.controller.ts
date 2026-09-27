import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlanosService } from './planos.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@ApiTags('planos')
@Controller('api/planos')
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos' })
  findAll() {
    return this.planosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um plano pelo ID' })
  findOne(@Param('id') id: string) {
    return this.planosService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo plano' })
  create(@Body() createPlanoDto: CreatePlanoDto) {
    return this.planosService.create(createPlanoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um plano' })
  update(@Param('id') id: string, @Body() updatePlanoDto: UpdatePlanoDto) {
    return this.planosService.update(+id, updatePlanoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um plano' })
  remove(@Param('id') id: string) {
    return this.planosService.remove(+id);
  }
}
