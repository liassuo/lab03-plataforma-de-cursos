import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, UsuarioLogado } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@ApiTags('modulos')
@Controller('api/modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os módulos' })
  findAll() {
    return this.modulosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um módulo pelo ID (com aulas)' })
  findOne(@Param('id') id: string) {
    return this.modulosService.findOne(+id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Criar um novo módulo em um curso' })
  create(@Body() createModuloDto: CreateModuloDto, @Req() req: { user: UsuarioLogado }) {
    return this.modulosService.create(createModuloDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  update(
    @Param('id') id: string,
    @Body() updateModuloDto: UpdateModuloDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.modulosService.update(+id, updateModuloDto, req.user);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('AUTOR', 'ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um módulo (e suas aulas)' })
  remove(@Param('id') id: string, @Req() req: { user: UsuarioLogado }) {
    return this.modulosService.remove(+id, req.user);
  }
}
