import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CursosModule } from './cursos/cursos.module';
import { ModulosModule } from './modulos/modulos.module';
import { AulasModule } from './aulas/aulas.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { ProgressoModule } from './progresso/progresso.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { TrilhasModule } from './trilhas/trilhas.module';
import { CertificadosModule } from './certificados/certificados.module';
import { PlanosModule } from './planos/planos.module';
import { AssinaturasModule } from './assinaturas/assinaturas.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    CategoriasModule,
    CursosModule,
    ModulosModule,
    AulasModule,
    MatriculasModule,
    ProgressoModule,
    AvaliacoesModule,
    TrilhasModule,
    CertificadosModule,
    PlanosModule,
    AssinaturasModule,
    PagamentosModule,
  ],
})
export class AppModule {}
