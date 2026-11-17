import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsuarioLogado } from '../common/roles.decorator';
import { ProgressoService } from './progresso.service';
import { MarcarProgressoDto } from './dto/marcar-progresso.dto';

@ApiTags('progresso')
@Controller('api/progresso')
export class ProgressoController {
  constructor(private readonly progressoService: ProgressoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar progresso (filtros opcionais por usuário e curso)' })
  findAll(@Query('idUsuario') idUsuario?: string, @Query('idCurso') idCurso?: string) {
    return this.progressoService.findAll(
      idUsuario ? +idUsuario : undefined,
      idCurso ? +idCurso : undefined,
    );
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Get('meu/:idCurso')
  @ApiOperation({ summary: 'Progresso do usuário logado em um curso (aulas concluídas e %)' })
  meu(@Param('idCurso') idCurso: string, @Req() req: { user: UsuarioLogado }) {
    return this.progressoService.meu(req.user.userId, +idCurso);
  }

  @Get('resumo/:idUsuario/:idCurso')
  @ApiOperation({ summary: 'Resumo do progresso de um aluno em um curso (%)' })
  resumo(@Param('idUsuario') idUsuario: string, @Param('idCurso') idCurso: string) {
    return this.progressoService.resumo(+idUsuario, +idCurso);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Marcar/atualizar o progresso de uma aula' })
  marcar(@Body() marcarProgressoDto: MarcarProgressoDto, @Req() req: { user: UsuarioLogado }) {
    return this.progressoService.marcar(marcarProgressoDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Desmarcar o progresso de uma aula' })
  desmarcar(@Param('idUsuario') idUsuario: string, @Param('idAula') idAula: string) {
    return this.progressoService.desmarcar(+idUsuario, +idAula);
  }
}
