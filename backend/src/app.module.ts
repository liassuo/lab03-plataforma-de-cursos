import { Module } from '@nestjs/common';
import { CategoriasController } from './controllers/categorias.controller';
import { CursosController } from './controllers/cursos.controller';
import { ModulosController } from './controllers/modulos.controller';
import { AulasController } from './controllers/aulas.controller';
import { UsuariosController } from './controllers/usuarios.controller';
import { MatriculasController } from './controllers/matriculas.controller';
import { ProgressoController } from './controllers/progresso.controller';
import { AvaliacoesController } from './controllers/avaliacoes.controller';
import { TrilhasController } from './controllers/trilhas.controller';
import { CertificadosController } from './controllers/certificados.controller';
import { PlanosController } from './controllers/planos.controller';
import { AssinaturasController } from './controllers/assinaturas.controller';
import { PagamentosController } from './controllers/pagamentos.controller';

@Module({
  controllers: [
    CategoriasController,
    CursosController,
    ModulosController,
    AulasController,
    UsuariosController,
    MatriculasController,
    ProgressoController,
    AvaliacoesController,
    TrilhasController,
    CertificadosController,
    PlanosController,
    AssinaturasController,
    PagamentosController,
  ],
})
export class AppModule {}
