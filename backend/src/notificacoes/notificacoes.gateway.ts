import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// WebSocket (socket.io) na mesma porta da API. O app se conecta depois do login
// e recebe as notificações na hora, sem precisar recarregar a tela.
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificacoesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  // O app envia o token JWT ao conectar; cada usuário entra na sua própria "sala"
  handleConnection(cliente: Socket) {
    try {
      const payload = this.jwtService.verify(cliente.handshake.auth.token);
      cliente.join(`usuario-${payload.sub}`);
    } catch {
      cliente.disconnect(); // token inválido ou ausente
    }
  }

  enviar(idUsuario: number, notificacao: unknown) {
    this.server.to(`usuario-${idUsuario}`).emit('notificacao', notificacao);
  }
}
