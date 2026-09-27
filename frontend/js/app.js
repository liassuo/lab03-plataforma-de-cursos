// ===== NAVEGAÇÃO =====

function navegarPara(secao) {
  document.querySelectorAll('.secao-pagina').forEach(s => s.classList.remove('ativa'));
  const alvo = document.getElementById(`secao-${secao}`);
  if (alvo) alvo.classList.add('ativa');

  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('ativo-secao'));
  const linkAtivo = document.querySelector(`[data-secao="${secao}"]`);
  if (linkAtivo) linkAtivo.classList.add('ativo-secao');

  carregarDadosSecao(secao);
}

function carregarDadosSecao(secao) {
  switch (secao) {
    case 'inicio':
      atualizarPainel();
      break;
    case 'usuarios':
      carregarUsuarios();
      break;
    case 'categorias':
      carregarCategorias();
      break;
    case 'cursos':
      popularSelectCategorias();
      popularSelectUsuarios();
      carregarCursos();
      break;
    case 'conteudo':
      popularSelectCursos();
      break;
    case 'trilhas':
      popularSelectCategorias();
      carregarTrilhas();
      break;
    case 'matriculas':
      popularSelectUsuarios();
      popularSelectCursos();
      carregarMatriculas();
      break;
    case 'progresso':
      popularSelectUsuarios();
      popularSelectCursos();
      break;
    case 'avaliacoes':
      popularSelectUsuarios();
      popularSelectCursos();
      carregarAvaliacoes();
      break;
    case 'certificados':
      popularSelectUsuarios();
      popularSelectCursos();
      carregarCertificados();
      break;
    case 'financeiro':
      popularSelectUsuarios();
      carregarPlanos();
      carregarAssinaturas();
      carregarPagamentos();
      break;
  }
}

// ===== PAINEL INICIAL =====

async function atualizarPainel() {
  try {
    const [usuarios, cursos, matriculas, certificados] = await Promise.all([
      api.get('usuarios'),
      api.get('cursos'),
      api.get('matriculas'),
      api.get('certificados'),
    ]);

    document.getElementById('totalUsuarios').textContent = usuarios.length;
    document.getElementById('totalCursos').textContent = cursos.length;
    document.getElementById('totalMatriculas').textContent = matriculas.length;
    document.getElementById('totalCertificados').textContent = certificados.length;

    // Cursos recentes
    const cursosDiv = document.getElementById('cursosRecentes');
    if (cursos.length === 0) {
      cursosDiv.innerHTML = '<p class="text-muted">Nenhum curso cadastrado</p>';
    } else {
      const recentes = cursos.slice(-5).reverse();
      cursosDiv.innerHTML = recentes.map(c => `
        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <span>${c.titulo}</span>
          <span class="badge bg-${c.nivel === 'Iniciante' ? 'success' : c.nivel === 'Intermediário' ? 'warning' : 'danger'}">${c.nivel}</span>
        </div>
      `).join('');
    }

    // Usuários recentes
    const usersDiv = document.getElementById('usuariosRecentes');
    if (usuarios.length === 0) {
      usersDiv.innerHTML = '<p class="text-muted">Nenhum usuário cadastrado</p>';
    } else {
      const recentes = usuarios.slice(-5).reverse();
      usersDiv.innerHTML = recentes.map(u => `
        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <span>${u.nomeCompleto}</span>
          <small class="text-muted">${u.email}</small>
        </div>
      `).join('');
    }
  } catch (erro) {
    console.error('Erro ao atualizar painel:', erro);
  }
}

// ===== UTILITÁRIOS =====

function formatarData(dataStr) {
  if (!dataStr) return '-';
  // O backend devolve datas no formato ISO (2025-01-15T00:00:00.000Z)
  const partes = String(dataStr).split('T')[0].split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function fecharModal(idModal) {
  const modalEl = document.getElementById(idModal);
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) modalInstance.hide();
}

function exibirToast(mensagem, tipo = 'success') {
  const container = document.getElementById('toastContainer');
  const toastId = 'toast-' + Date.now();

  const icone = tipo === 'success' ? 'bi-check-circle-fill'
    : tipo === 'danger' ? 'bi-exclamation-circle-fill'
    : 'bi-info-circle-fill';

  const div = document.createElement('div');
  div.id = toastId;
  div.className = `toast align-items-center text-bg-${tipo} border-0`;
  div.setAttribute('role', 'alert');
  div.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi ${icone} me-2"></i>${mensagem}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(div);
  const toast = new bootstrap.Toast(div, { delay: 3000 });
  toast.show();

  div.addEventListener('hidden.bs.toast', () => div.remove());
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
  // Navegação por clique nos links
  document.querySelectorAll('[data-secao]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navegarPara(link.dataset.secao);
    });
  });

  // Listener do select de curso na seção conteúdo
  const selectConteudo = document.getElementById('selectCursoConteudo');
  if (selectConteudo) {
    selectConteudo.addEventListener('change', aoSelecionarCursoConteudo);
  }

  // Listener do filtro de categoria nos cursos
  const filtroCategoria = document.getElementById('filtroCursoCategoria');
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', carregarCursos);
  }

  // Exige login antes de usar a plataforma
  atualizarNavbarAuth();
  if (estaLogado()) {
    atualizarPainel();
  } else {
    abrirModalLogin();
  }
});
