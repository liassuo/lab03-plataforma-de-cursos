// ===== CLIENTE DA API (backend NestJS) =====

const API_URL = 'http://localhost:3000/api';

class ApiClient {
  // Monta os cabeçalhos, incluindo o token JWT quando o usuário está logado
  _headers() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('edu_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }

  async _request(metodo, recurso, dados) {
    const opcoes = {
      method: metodo,
      headers: this._headers(),
    };
    if (dados !== undefined) {
      opcoes.body = JSON.stringify(dados);
    }

    let resposta;
    try {
      resposta = await fetch(`${API_URL}/${recurso}`, opcoes);
    } catch (e) {
      throw new Error('Não foi possível conectar ao servidor. O backend está rodando?');
    }

    const corpo = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      // Sessão expirada ou sem login: volta para a tela de login
      if (resposta.status === 401 && recurso !== 'auth/login') {
        fazerLogout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      // O NestJS pode devolver a mensagem como string ou array (validação)
      const mensagem = Array.isArray(corpo.message)
        ? corpo.message.join(', ')
        : corpo.message || 'Erro na requisição';
      throw new Error(mensagem);
    }

    return corpo;
  }

  get(recurso) {
    return this._request('GET', recurso);
  }

  post(recurso, dados) {
    return this._request('POST', recurso, dados);
  }

  put(recurso, dados) {
    return this._request('PUT', recurso, dados);
  }

  delete(recurso) {
    return this._request('DELETE', recurso);
  }
}

const api = new ApiClient();
