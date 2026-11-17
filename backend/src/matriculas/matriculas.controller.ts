import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, UsuarioLogado } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@ApiTags('matriculas')
@ApiBearerAuth('token')
@Controller('api/matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas (ADMIN)' })
  findAll() {
    return this.matriculasService.findAll();
  }

  // Precisa vir antes de ':id', senão "minhas" seria lido como um id
  @UseGuards(AuthGuard('jwt'))
  @Get('minhas')
  @ApiOperation({ summary: 'Listar as matrículas do usuário logado' })
  minhas(@Req() req: { user: UsuarioLogado }) {
    return this.matriculasService.findByUsuario(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID (ADMIN)' })
  findOne(@Param('id') id: string) {
    return this.matriculasService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ALUNO', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Comprar um curso: cria a matrícula e registra o pagamento' })
  create(@Body() createMatriculaDto: CreateMatriculaDto, @Req() req: { user: UsuarioLogado }) {
    return this.matriculasService.create(createMatriculaDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.matriculasService.remove(+id);
  }
}
