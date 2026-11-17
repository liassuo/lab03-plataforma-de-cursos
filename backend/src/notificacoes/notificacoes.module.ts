import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { NotificacoesGateway } from './notificacoes.gateway';

@Module({
  // JwtModule: o gateway valida o token de quem se conecta pelo WebSocket
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [NotificacoesController],
  providers: [NotificacoesService, NotificacoesGateway],
})
export class NotificacoesModule {}
