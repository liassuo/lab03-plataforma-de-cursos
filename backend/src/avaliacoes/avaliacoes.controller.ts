import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

@ApiTags('avaliacoes')
@Controller('api/avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  findAll() {
    return this.avaliacoesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Avaliar um curso (nota de 1 a 5)' })
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(createAvaliacaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma avaliação' })
  remove(@Param('id') id: string) {
    return this.avaliacoesService.remove(+id);
  }
}
