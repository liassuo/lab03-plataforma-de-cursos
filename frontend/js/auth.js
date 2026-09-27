// ===== AUTENTICAÇÃO (login / logout / token) =====

function estaLogado() {
  return !!localStorage.getItem('edu_token');
}

function obterUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('edu_usuario'));
  } catch (e) {
    return null;
  }
}

function abrirModalLogin() {
  const modalEl = document.getElementById('modalLogin');
  // backdrop estático: não deixa fechar clicando fora enquanto não logar
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
    backdrop: 'static',
    keyboard: false,
  });
  modal.show();
}

async function fazerLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;
  const erroDiv = document.getElementById('loginErro');
  erroDiv.classList.add('d-none');

  try {
    const resposta = await api.post('auth/login', { email, senha });

    // Guarda o token JWT e os dados do usuário no navegador
    localStorage.setItem('edu_token', resposta.access_token);
    localStorage.setItem('edu_usuario', JSON.stringify(resposta.usuario));

    fecharModal('modalLogin');
    document.getElementById('formLogin').reset();
    atualizarNavbarAuth();
    exibirToast(`Bem-vindo(a), ${resposta.usuario.nomeCompleto}!`);
    navegarPara('inicio');
  } catch (erro) {
    erroDiv.textContent = erro.message;
    erroDiv.classList.remove('d-none');
  }
}

function fazerLogout() {
  localStorage.removeItem('edu_token');
  localStorage.removeItem('edu_usuario');
  atualizarNavbarAuth();
  abrirModalLogin();
}

// Mostra o nome do usuário logado e o botão de sair na navbar
function atualizarNavbarAuth() {
  const container = document.getElementById('navAuth');
  if (!container) return;

  const usuario = obterUsuarioLogado();
  if (usuario) {
    container.innerHTML = `
      <span class="navbar-text text-white me-3">
        <i class="bi bi-person-circle me-1"></i>${usuario.nomeCompleto}
      </span>
      <button class="btn btn-sm btn-outline-light" onclick="fazerLogout()">
        <i class="bi bi-box-arrow-right me-1"></i>Sair
      </button>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-sm btn-outline-light" onclick="abrirModalLogin()">
        <i class="bi bi-box-arrow-in-right me-1"></i>Entrar
      </button>
    `;
  }
}
