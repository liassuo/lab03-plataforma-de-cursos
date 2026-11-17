import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, UsuarioLogado } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';

@ApiTags('certificados')
@Controller('api/certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Listar todos os certificados emitidos (ADMIN)' })
  findAll() {
    return this.certificadosService.findAll();
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Get('meus')
  @ApiOperation({ summary: 'Listar os certificados do usuário logado' })
  meus(@Req() req: { user: UsuarioLogado }) {
    return this.certificadosService.findByUsuario(req.user.userId);
  }

  @Get('verificar/:codigo')
  @ApiOperation({ summary: 'Verificar a autenticidade de um certificado pelo código' })
  verificar(@Param('codigo') codigo: string) {
    return this.certificadosService.verificar(codigo);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Emitir um certificado (gera código de verificação)' })
  gerar(@Body() createCertificadoDto: CreateCertificadoDto, @Req() req: { user: UsuarioLogado }) {
    return this.certificadosService.gerar(createCertificadoDto, req.user);
  }
}
