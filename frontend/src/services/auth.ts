import { api } from './api'
import type { Usuario } from '../models'
import { conectarSocket, desconectarSocket } from './socket'

interface RespostaLogin {
  access_token: string
  usuario: Usuario
}

export async function fazerLogin(email: string, senha: string): Promise<Usuario> {
  const resposta = await api.post<RespostaLogin>('auth/login', { email, senha })

  // Guarda o token JWT e os dados do usuário no navegador
  localStorage.setItem('edu_token', resposta.access_token)
  localStorage.setItem('edu_usuario', JSON.stringify(resposta.usuario))
  conectarSocket() // passa a receber notificações em tempo real

  return resposta.usuario
}

export function fazerLogout(): void {
  localStorage.removeItem('edu_token')
  localStorage.removeItem('edu_usuario')
  desconectarSocket()
}

export function estaLogado(): boolean {
  const token = localStorage.getItem('edu_token')
  if (!token) return false

  // O JWT guarda a data de validade (exp, em segundos) no meio do token, em base64.
  // Token vencido conta como deslogado, sem precisar chamar a API para descobrir
  try {
    const conteudo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(conteudo))
    if (exp * 1000 > Date.now()) return true
  } catch {
    // token mal formado: trata como deslogado
  }

  fazerLogout()
  return false
}

// Páginas que todos os perfis podem abrir (catálogo, página do curso e avisos)
const paginasDeTodos = ['/', '/catalogo', '/curso', '/avisos']

// Páginas extras de cada perfil
const paginasPorTipo: Record<string, string[]> = {
  ADMIN: ['/usuarios', '/categorias', '/cursos', '/conteudo', '/trilhas',
    '/matriculas', '/progresso', '/avaliacoes', '/certificados', '/financeiro'],
  AUTOR: ['/cursos', '/conteudo'],
  ALUNO: ['/meus-cursos'],
}

export function podeAcessar(caminho: string): boolean {
  const tipo = obterUsuarioLogado()?.tipo ?? 'ALUNO'
  // "/curso/5" vira "/curso" para comparar com a lista
  const pagina = '/' + caminho.split('/')[1]
  return paginasDeTodos.includes(pagina) || paginasPorTipo[tipo].includes(pagina)
}

export function obterUsuarioLogado(): Usuario | null {
  try {
    return JSON.parse(localStorage.getItem('edu_usuario') || 'null')
  } catch {
    return null
  }
}
