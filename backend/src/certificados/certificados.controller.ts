import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';

@ApiTags('certificados')
@Controller('api/certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os certificados emitidos' })
  findAll() {
    return this.certificadosService.findAll();
  }

  @Get('verificar/:codigo')
  @ApiOperation({ summary: 'Verificar a autenticidade de um certificado pelo código' })
  verificar(@Param('codigo') codigo: string) {
    return this.certificadosService.verificar(codigo);
  }

  @Post()
  @ApiOperation({ summary: 'Emitir um certificado (gera código de verificação)' })
  gerar(@Body() createCertificadoDto: CreateCertificadoDto) {
    return this.certificadosService.gerar(createCertificadoDto);
  }
}
