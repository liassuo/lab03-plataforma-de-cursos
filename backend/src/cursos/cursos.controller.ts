import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, UsuarioLogado } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@ApiTags('cursos')
@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos (com categoria e instrutor)' })
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um curso pelo ID (com módulos e aulas)' })
  findOne(@Param('id') id: string) {
    return this.cursosService.findOne(+id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Criar um novo curso' })
  create(@Body() createCursoDto: CreateCursoDto, @Req() req: { user: UsuarioLogado }) {
    return this.cursosService.create(createCursoDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um curso' })
  update(
    @Param('id') id: string,
    @Body() updateCursoDto: UpdateCursoDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.cursosService.update(+id, updateCursoDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um curso' })
  remove(@Param('id') id: string, @Req() req: { user: UsuarioLogado }) {
    return this.cursosService.remove(+id, req.user);
  }
}
