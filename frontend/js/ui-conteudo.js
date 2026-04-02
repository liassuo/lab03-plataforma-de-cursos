// ===== MÓDULOS E AULAS =====

let cursoSelecionadoConteudo = null;

function aoSelecionarCursoConteudo() {
  const select = document.getElementById('selectCursoConteudo');
  const idCurso = select.value;

  if (!idCurso) {
    document.getElementById('conteudoCurso').style.display = 'none';
    cursoSelecionadoConteudo = null;
    return;
  }

  cursoSelecionadoConteudo = +idCurso;
  document.getElementById('conteudoCurso').style.display = 'block';
  carregarConteudoCurso(+idCurso);
}

async function carregarConteudoCurso(idCurso) {
  try {
    const curso = await api.get(`cursos/${idCurso}`);
    document.getElementById('tituloCursoConteudo').textContent = curso.titulo;

    const container = document.getElementById('listaModulosAulas');
    container.innerHTML = '';

    if (!curso.modulos || curso.modulos.length === 0) {
      container.innerHTML = '<p class="text-muted">Nenhum módulo cadastrado. Adicione um módulo para começar.</p>';
      return;
    }

    curso.modulos.forEach(modulo => {
      const divModulo = document.createElement('div');
      divModulo.className = 'card mb-3';
      divModulo.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center bg-light">
          <span>
            <strong>Módulo ${modulo.ordem}:</strong> ${modulo.titulo}
          </span>
          <div>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalAula(${modulo.id})">
              <i class="bi bi-plus-lg me-1"></i>Aula
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="removerModulo(${modulo.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          ${renderizarAulasModulo(modulo.aulas || [])}
        </div>
      `;
      container.appendChild(divModulo);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar conteúdo: ' + erro.message, 'danger');
  }
}

function renderizarAulasModulo(aulas) {
  if (aulas.length === 0) {
    return '<p class="text-muted p-3 mb-0">Nenhuma aula neste módulo</p>';
  }

  let html = '<ul class="list-group list-group-flush">';
  aulas.forEach(aula => {
    const icone = aula.tipoConteudo === 'Video' ? 'bi-play-circle'
      : aula.tipoConteudo === 'Texto' ? 'bi-file-text'
      : 'bi-question-circle';

    html += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>
          <i class="bi ${icone} me-2"></i>
          <strong>${aula.ordem}.</strong> ${aula.titulo}
          <small class="text-muted ms-2">(${aula.duracaoMinutos} min)</small>
        </span>
        <button class="btn btn-sm btn-outline-danger" onclick="removerAula(${aula.id})">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `;
  });
  html += '</ul>';
  return html;
}

async function salvarModulo(event) {
  event.preventDefault();

  if (!cursoSelecionadoConteudo) {
    exibirToast('Selecione um curso primeiro', 'warning');
    return;
  }

  const titulo = document.getElementById('moduloTitulo').value.trim();
  const ordem = document.getElementById('moduloOrdem').value;

  if (!titulo) {
    exibirToast('Informe o título do módulo', 'warning');
    return;
  }

  try {
    const dados = { idCurso: cursoSelecionadoConteudo, titulo };
    if (ordem) dados.ordem = +ordem;

    await api.post('modulos', dados);
    fecharModal('modalModulo');
    document.getElementById('formModulo').reset();
    carregarConteudoCurso(cursoSelecionadoConteudo);
    exibirToast('Módulo criado');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

function abrirModalAula(idModulo) {
  document.getElementById('aulaIdModulo').value = idModulo;
  const modal = new bootstrap.Modal(document.getElementById('modalAula'));
  modal.show();
}

async function salvarAula(event) {
  event.preventDefault();

  const idModulo = document.getElementById('aulaIdModulo').value;
  const titulo = document.getElementById('aulaTitulo').value.trim();
  const tipoConteudo = document.getElementById('aulaTipo').value;
  const duracao = document.getElementById('aulaDuracao').value;
  const url = document.getElementById('aulaUrl').value.trim();

  if (!titulo || !duracao) {
    exibirToast('Preencha os campos obrigatórios', 'warning');
    return;
  }

  try {
    await api.post('aulas', {
      idModulo: +idModulo,
      titulo,
      tipoConteudo,
      duracaoMinutos: +duracao,
      urlConteudo: url,
    });
    fecharModal('modalAula');
    document.getElementById('formAula').reset();
    carregarConteudoCurso(cursoSelecionadoConteudo);
    exibirToast('Aula adicionada');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerModulo(id) {
  if (!confirm('Remover módulo e todas as suas aulas?')) return;
  try {
    await api.delete(`modulos/${id}`);
    carregarConteudoCurso(cursoSelecionadoConteudo);
    exibirToast('Módulo removido');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerAula(id) {
  if (!confirm('Remover esta aula?')) return;
  try {
    await api.delete(`aulas/${id}`);
    carregarConteudoCurso(cursoSelecionadoConteudo);
    exibirToast('Aula removida');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}
