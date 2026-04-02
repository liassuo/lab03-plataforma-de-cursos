// ===== USUÁRIOS =====

async function carregarUsuarios() {
  try {
    const usuarios = await api.get('usuarios');
    const tbody = document.getElementById('tabelaUsuarios');
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum usuário cadastrado</td></tr>';
      return;
    }

    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nomeCompleto}</td>
        <td>${u.email}</td>
        <td>${formatarData(u.dataCadastro)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="removerUsuario(${u.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar usuários: ' + erro.message, 'danger');
  }
}

async function salvarUsuario(event) {
  event.preventDefault();

  const nome = document.getElementById('usuarioNome').value.trim();
  const email = document.getElementById('usuarioEmail').value.trim();
  const senha = document.getElementById('usuarioSenha').value;

  if (!nome || !email) {
    exibirToast('Preencha todos os campos obrigatórios', 'warning');
    return;
  }

  if (!validarEmail(email)) {
    exibirToast('Email inválido', 'warning');
    return;
  }

  try {
    await api.post('usuarios', { nomeCompleto: nome, email, senha });
    fecharModal('modalUsuario');
    document.getElementById('formUsuario').reset();
    carregarUsuarios();
    atualizarPainel();
    exibirToast('Usuário cadastrado com sucesso');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerUsuario(id) {
  if (!confirm('Deseja remover este usuário?')) return;
  try {
    await api.delete(`usuarios/${id}`);
    carregarUsuarios();
    atualizarPainel();
    exibirToast('Usuário removido');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

// ===== CATEGORIAS =====

async function carregarCategorias() {
  try {
    const categorias = await api.get('categorias');
    const container = document.getElementById('listaCategoriasCards');
    container.innerHTML = '';

    if (categorias.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhuma categoria cadastrada</p></div>';
      return;
    }

    const cursos = await api.get('cursos');

    categorias.forEach(cat => {
      const qtdCursos = cursos.filter(c => c.idCategoria === cat.id).length;
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${cat.nome}</h5>
            <p class="card-text text-muted">${cat.descricao || 'Sem descrição'}</p>
            <span class="badge bg-primary">${qtdCursos} curso(s)</span>
          </div>
          <div class="card-footer bg-transparent">
            <button class="btn btn-sm btn-outline-danger" onclick="removerCategoria(${cat.id})">
              <i class="bi bi-trash me-1"></i>Remover
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar categorias: ' + erro.message, 'danger');
  }
}

async function salvarCategoria(event) {
  event.preventDefault();

  const nome = document.getElementById('categoriaNome').value.trim();
  const descricao = document.getElementById('categoriaDescricao').value.trim();

  if (!nome) {
    exibirToast('Informe o nome da categoria', 'warning');
    return;
  }

  try {
    await api.post('categorias', { nome, descricao });
    fecharModal('modalCategoria');
    document.getElementById('formCategoria').reset();
    carregarCategorias();
    exibirToast('Categoria criada com sucesso');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerCategoria(id) {
  if (!confirm('Deseja remover esta categoria?')) return;
  try {
    await api.delete(`categorias/${id}`);
    carregarCategorias();
    exibirToast('Categoria removida');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

// ===== CURSOS =====

async function carregarCursos() {
  try {
    const cursos = await api.get('cursos');
    const container = document.getElementById('listaCursosCards');
    container.innerHTML = '';

    const filtroCategoria = document.getElementById('filtroCursoCategoria').value;
    const cursosFiltrados = filtroCategoria
      ? cursos.filter(c => c.idCategoria === +filtroCategoria)
      : cursos;

    if (cursosFiltrados.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhum curso encontrado</p></div>';
      return;
    }

    cursosFiltrados.forEach(curso => {
      const corNivel = curso.nivel === 'Iniciante' ? 'success' : curso.nivel === 'Intermediário' ? 'warning' : 'danger';
      const nomeInstrutor = curso.instrutor ? curso.instrutor.nomeCompleto : 'N/A';
      const nomeCategoria = curso.categoria ? curso.categoria.nome : 'N/A';

      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${curso.titulo}</h5>
              <span class="badge bg-${corNivel} badge-nivel">${curso.nivel}</span>
            </div>
            <p class="card-text text-muted small">${curso.descricao || 'Sem descrição'}</p>
            <div class="small">
              <p class="mb-1"><i class="bi bi-folder me-1"></i>${nomeCategoria}</p>
              <p class="mb-1"><i class="bi bi-person me-1"></i>${nomeInstrutor}</p>
              <p class="mb-1"><i class="bi bi-collection-play me-1"></i>${curso.totalAulas} aulas - ${curso.totalHoras}h</p>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <button class="btn btn-sm btn-outline-danger" onclick="removerCurso(${curso.id})">
              <i class="bi bi-trash me-1"></i>Remover
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar cursos: ' + erro.message, 'danger');
  }
}

async function salvarCurso(event) {
  event.preventDefault();

  const titulo = document.getElementById('cursoTitulo').value.trim();
  const descricao = document.getElementById('cursoDescricao').value.trim();
  const idCategoria = document.getElementById('cursoCategoria').value;
  const idInstrutor = document.getElementById('cursoInstrutor').value;
  const nivel = document.getElementById('cursoNivel').value;

  if (!titulo || !idCategoria || !idInstrutor) {
    exibirToast('Preencha todos os campos obrigatórios', 'warning');
    return;
  }

  try {
    await api.post('cursos', { titulo, descricao, idCategoria, idInstrutor, nivel });
    fecharModal('modalCurso');
    document.getElementById('formCurso').reset();
    carregarCursos();
    atualizarPainel();
    exibirToast('Curso criado com sucesso');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerCurso(id) {
  if (!confirm('Deseja remover este curso?')) return;
  try {
    await api.delete(`cursos/${id}`);
    carregarCursos();
    atualizarPainel();
    exibirToast('Curso removido');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

// ===== POPULAR SELECTS =====

async function popularSelectCategorias() {
  try {
    const categorias = await api.get('categorias');
    const selects = [
      document.getElementById('cursoCategoria'),
      document.getElementById('filtroCursoCategoria'),
      document.getElementById('trilhaCategoria'),
    ];

    selects.forEach(sel => {
      if (!sel) return;
      const valorAtual = sel.value;
      const primeiraOpcao = sel.options[0].outerHTML;
      sel.innerHTML = primeiraOpcao;
      categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.nome;
        sel.appendChild(opt);
      });
      sel.value = valorAtual;
    });
  } catch (erro) {
    console.error('Erro ao popular categorias:', erro);
  }
}

async function popularSelectUsuarios() {
  try {
    const usuarios = await api.get('usuarios');
    const ids = [
      'cursoInstrutor', 'matriculaUsuario', 'avaliacaoUsuario',
      'selectUsuarioProgresso', 'selectUsuarioCert', 'selectUsuarioAssinatura',
    ];

    ids.forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const valorAtual = sel.value;
      const primeiraOpcao = sel.options[0].outerHTML;
      sel.innerHTML = primeiraOpcao;
      usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.nomeCompleto;
        sel.appendChild(opt);
      });
      sel.value = valorAtual;
    });
  } catch (erro) {
    console.error('Erro ao popular usuários:', erro);
  }
}

async function popularSelectCursos() {
  try {
    const cursos = await api.get('cursos');
    const ids = [
      'matriculaCurso', 'avaliacaoCurso', 'selectCursoConteudo',
      'selectCursoProgresso', 'selectCursoCert', 'trilhaCursoCurso',
    ];

    ids.forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const valorAtual = sel.value;
      const primeiraOpcao = sel.options[0].outerHTML;
      sel.innerHTML = primeiraOpcao;
      cursos.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.titulo;
        sel.appendChild(opt);
      });
      sel.value = valorAtual;
    });
  } catch (erro) {
    console.error('Erro ao popular cursos:', erro);
  }
}
