import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssinaturasService } from './assinaturas.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';

@ApiTags('assinaturas')
@Controller('api/assinaturas')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as assinaturas' })
  findAll() {
    return this.assinaturasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma assinatura pelo ID' })
  findOne(@Param('id') id: string) {
    return this.assinaturasService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Assinar um plano (calcula a data de fim automaticamente)' })
  create(@Body() createAssinaturaDto: CreateAssinaturaDto) {
    return this.assinaturasService.create(createAssinaturaDto);
  }
}
