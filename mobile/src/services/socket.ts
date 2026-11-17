import { io, Socket } from 'socket.io-client';
import { Notificacao } from '../types';
import { SERVIDOR } from './config';

// Conexão WebSocket com o backend, usada para receber notificações em tempo real
let socket: Socket | null = null;

export function conectarSocket(token: string) {
  // O backend confere o token e coloca o usuário na sala dele
  socket = io(SERVIDOR, { auth: { token }, transports: ['websocket'] });
}

export function desconectarSocket() {
  socket?.disconnect();
  socket = null;
}

// Chama a função a cada notificação nova. Retorna outra função que cancela a escuta
// (usada no retorno do useEffect, quando a tela sai)
export function aoReceberNotificacao(funcao: (notificacao: Notificacao) => void) {
  socket?.on('notificacao', funcao);
  return () => {
    socket?.off('notificacao', funcao);
  };
}
