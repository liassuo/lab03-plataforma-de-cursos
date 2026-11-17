import { io, Socket } from 'socket.io-client'
import type { Notificacao } from '../models'

// Conexão WebSocket com o backend, usada para receber notificações em tempo real
let socket: Socket | null = null

export function conectarSocket(): void {
  const token = localStorage.getItem('edu_token')
  if (!token || socket) return
  // O backend confere o token e coloca o usuário na sala dele
  socket = io('http://localhost:3000', { auth: { token } })
}

export function desconectarSocket(): void {
  socket?.disconnect()
  socket = null
}

// Chama a função a cada notificação nova. Retorna outra função que cancela a escuta
export function aoReceberNotificacao(funcao: (notificacao: Notificacao) => void): () => void {
  socket?.on('notificacao', funcao)
  return () => {
    socket?.off('notificacao', funcao)
  }
}
