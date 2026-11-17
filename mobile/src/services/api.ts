import { Usuario } from '../types';
import { SERVIDOR } from './config';
import { conectarSocket, desconectarSocket } from './socket';

const API_URL = `${SERVIDOR}/api`;

// Token JWT e usuário logado, guardados em memória enquanto o app está aberto
let token: string | null = null;
let usuarioLogado: Usuario | null = null;

async function requisicao<T>(metodo: string, recurso: string, dados?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}/${recurso}`, {
      method: metodo,
      headers,
      body: dados !== undefined ? JSON.stringify(dados) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. O backend está rodando?');
  }

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // O NestJS devolve a mensagem como string ou como array (erros de validação)
    const mensagem = Array.isArray(corpo.message) ? corpo.message.join(', ') : corpo.message;
    throw new Error(mensagem || 'Erro na requisição');
  }

  return corpo as T;
}

export const api = {
  get: <T>(recurso: string) => requisicao<T>('GET', recurso),
  post: <T>(recurso: string, dados?: unknown) => requisicao<T>('POST', recurso, dados),
  put: <T>(recurso: string, dados?: unknown) => requisicao<T>('PUT', recurso, dados),
  delete: <T>(recurso: string) => requisicao<T>('DELETE', recurso),
};

interface RespostaLogin {
  access_token: string;
  usuario: Usuario;
}

export async function fazerLogin(email: string, senha: string): Promise<Usuario> {
  const resposta = await api.post<RespostaLogin>('auth/login', { email, senha });
  token = resposta.access_token;
  usuarioLogado = resposta.usuario;
  conectarSocket(resposta.access_token); // passa a receber notificações em tempo real
  return resposta.usuario;
}

export function fazerLogout() {
  token = null;
  usuarioLogado = null;
  desconectarSocket();
}

// As telas usam esta função para saber quem está logado
export function obterUsuario(): Usuario {
  return usuarioLogado as Usuario;
}
