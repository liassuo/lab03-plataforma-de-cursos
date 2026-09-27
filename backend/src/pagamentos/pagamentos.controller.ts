import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';

@ApiTags('pagamentos')
@Controller('api/pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  findAll() {
    return this.pagamentosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID' })
  findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar um pagamento (simula gateway)' })
  create(@Body() createPagamentoDto: CreatePagamentoDto) {
    return this.pagamentosService.create(createPagamentoDto);
  }
}
