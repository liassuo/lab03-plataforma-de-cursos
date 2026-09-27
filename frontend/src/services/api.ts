// Cliente HTTP da API (backend NestJS)

const API_URL = 'http://localhost:3000/api'

async function requisicao<T>(metodo: string, recurso: string, dados?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // Envia o token JWT quando o usuário está logado
  const token = localStorage.getItem('edu_token')
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }

  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}/${recurso}`, {
      method: metodo,
      headers,
      body: dados !== undefined ? JSON.stringify(dados) : undefined,
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. O backend está rodando?')
  }

  const corpo = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    // Token expirado ou ausente: volta para a tela de login
    if (resposta.status === 401 && recurso !== 'auth/login') {
      localStorage.removeItem('edu_token')
      localStorage.removeItem('edu_usuario')
      window.location.hash = '#/login'
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    // O NestJS pode devolver a mensagem como string ou array (erros de validação)
    const mensagem = Array.isArray(corpo.message)
      ? corpo.message.join(', ')
      : corpo.message || 'Erro na requisição'
    throw new Error(mensagem)
  }

  return corpo as T
}

export const api = {
  get: <T>(recurso: string) => requisicao<T>('GET', recurso),
  post: <T>(recurso: string, dados?: unknown) => requisicao<T>('POST', recurso, dados),
  put: <T>(recurso: string, dados?: unknown) => requisicao<T>('PUT', recurso, dados),
  delete: <T>(recurso: string) => requisicao<T>('DELETE', recurso),
}
