import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, UsuarioLogado } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AulasService } from './aulas.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@ApiTags('aulas')
@Controller('api/aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as aulas' })
  findAll() {
    return this.aulasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma aula pelo ID' })
  findOne(@Param('id') id: string) {
    return this.aulasService.findOne(+id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Criar uma nova aula em um módulo' })
  create(@Body() createAulaDto: CreateAulaDto, @Req() req: { user: UsuarioLogado }) {
    return this.aulasService.create(createAulaDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma aula' })
  update(
    @Param('id') id: string,
    @Body() updateAulaDto: UpdateAulaDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.aulasService.update(+id, updateAulaDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma aula' })
  remove(@Param('id') id: string, @Req() req: { user: UsuarioLogado }) {
    return this.aulasService.remove(+id, req.user);
  }
}
