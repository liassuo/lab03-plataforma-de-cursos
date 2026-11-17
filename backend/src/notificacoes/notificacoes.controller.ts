import { Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioLogado } from '../common/roles.decorator';
import { NotificacoesService } from './notificacoes.service';

@ApiTags('notificacoes')
@Controller('api/notificacoes')
export class NotificacoesController {
  private logger = new Logger('Kafka');

  constructor(private readonly notificacoesService: NotificacoesService) {}

  // ===== Consumidor do Kafka: cada @EventPattern escuta um tópico =====

  @EventPattern('usuario-criado')
  async usuarioCriado(@Payload() usuario: { id: number; nomeCompleto: string }) {
    this.logger.log(`Evento usuario-criado recebido: ${usuario.nomeCompleto}`);
    const primeiroNome = usuario.nomeCompleto.split(' ')[0];
    await this.notificacoesService.criar(
      usuario.id,
      `Bem-vindo(a) à plataforma, ${primeiroNome}! Explore os cursos disponíveis.`,
    );
  }

  @EventPattern('curso-atualizado')
  async cursoAtualizado(@Payload() evento: { idCurso: number; mensagem: string }) {
    this.logger.log(`Evento curso-atualizado recebido: curso ${evento.idCurso}`);
    await this.notificacoesService.avisarMatriculados(evento.idCurso, evento.mensagem);
  }

  // ===== Rotas REST usadas pelo app =====

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Get('minhas')
  @ApiOperation({ summary: 'Listar as notificações do usuário logado' })
  minhas(@Req() req: { user: UsuarioLogado }) {
    return this.notificacoesService.minhas(req.user.userId);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Post('lidas')
  @ApiOperation({ summary: 'Marcar todas as notificações do usuário logado como lidas' })
  marcarComoLidas(@Req() req: { user: UsuarioLogado }) {
    return this.notificacoesService.marcarComoLidas(req.user.userId);
  }
}
