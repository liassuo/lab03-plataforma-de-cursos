import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
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
import { MensageriaModule } from './mensageria/mensageria.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
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
    MensageriaModule,
    NotificacoesModule,
  ],
})
export class AppModule {}
