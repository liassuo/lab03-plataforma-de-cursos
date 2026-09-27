import { api } from './api'
import type { Usuario } from '../models'

interface RespostaLogin {
  access_token: string
  usuario: Usuario
}

export async function fazerLogin(email: string, senha: string): Promise<Usuario> {
  const resposta = await api.post<RespostaLogin>('auth/login', { email, senha })

  // Guarda o token JWT e os dados do usuário no navegador
  localStorage.setItem('edu_token', resposta.access_token)
  localStorage.setItem('edu_usuario', JSON.stringify(resposta.usuario))

  return resposta.usuario
}

export function fazerLogout(): void {
  localStorage.removeItem('edu_token')
  localStorage.removeItem('edu_usuario')
}

export function estaLogado(): boolean {
  return !!localStorage.getItem('edu_token')
}

export function obterUsuarioLogado(): Usuario | null {
  try {
    return JSON.parse(localStorage.getItem('edu_usuario') || 'null')
  } catch {
    return null
  }
}
