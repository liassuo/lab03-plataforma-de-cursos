import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesGateway } from './notificacoes.gateway';

@Injectable()
export class NotificacoesService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificacoesGateway,
  ) {}

  // Salva no banco (histórico) e envia em tempo real pelo WebSocket
  async criar(idUsuario: number, mensagem: string) {
    const notificacao = await this.prisma.notificacao.create({
      data: { idUsuario, mensagem },
    });
    this.gateway.enviar(idUsuario, notificacao);
    return notificacao;
  }

  // Avisa todos os alunos matriculados em um curso
  async avisarMatriculados(idCurso: number, mensagem: string) {
    const matriculas = await this.prisma.matricula.findMany({ where: { idCurso } });
    for (const matricula of matriculas) {
      await this.criar(matricula.idUsuario, mensagem);
    }
  }

  minhas(idUsuario: number) {
    return this.prisma.notificacao.findMany({
      where: { idUsuario },
      orderBy: { dataCriacao: 'desc' },
    });
  }

  async marcarComoLidas(idUsuario: number) {
    await this.prisma.notificacao.updateMany({
      where: { idUsuario, lida: false },
      data: { lida: true },
    });
    return { mensagem: 'Notificações marcadas como lidas' };
  }
}
