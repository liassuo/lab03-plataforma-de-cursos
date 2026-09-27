import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Get('resumo/:idUsuario/:idCurso')
  @ApiOperation({ summary: 'Resumo do progresso de um aluno em um curso (%)' })
  resumo(@Param('idUsuario') idUsuario: string, @Param('idCurso') idCurso: string) {
    return this.progressoService.resumo(+idUsuario, +idCurso);
  }

  @Post()
  @ApiOperation({ summary: 'Marcar/atualizar o progresso de uma aula' })
  marcar(@Body() marcarProgressoDto: MarcarProgressoDto) {
    return this.progressoService.marcar(marcarProgressoDto);
  }

  @Delete(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Desmarcar o progresso de uma aula' })
  desmarcar(@Param('idUsuario') idUsuario: string, @Param('idAula') idAula: string) {
    return this.progressoService.desmarcar(+idUsuario, +idAula);
  }
}
