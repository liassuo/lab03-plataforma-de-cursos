const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

class ApiClient {
  async get(recurso) {
    const resp = await fetch(`${API_URL}/${recurso}`);
    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.message || 'Erro ao buscar dados');
    }
    return resp.json();
  }

  async post(recurso, dados) {
    const resp = await fetch(`${API_URL}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.message || 'Erro ao salvar dados');
    }
    return resp.json();
  }

  async put(recurso, dados) {
    const resp = await fetch(`${API_URL}/${recurso}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.message || 'Erro ao atualizar dados');
    }
    return resp.json();
  }

  async delete(recurso) {
    const resp = await fetch(`${API_URL}/${recurso}`, { method: 'DELETE' });
    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.message || 'Erro ao remover');
    }
    return resp.json();
  }
}

const api = new ApiClient();
