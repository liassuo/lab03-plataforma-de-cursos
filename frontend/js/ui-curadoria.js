// ===== TRILHAS =====

async function carregarTrilhas() {
  try {
    const trilhas = await api.get('trilhas');
    const container = document.getElementById('listaTrilhasCards');
    container.innerHTML = '';

    if (trilhas.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhuma trilha cadastrada</p></div>';
      return;
    }

    trilhas.forEach(trilha => {
      const nomeCategoria = trilha.categoria ? trilha.categoria.nome : 'N/A';

      let cursosHtml = '';
      if (trilha.cursos && trilha.cursos.length > 0) {
        cursosHtml = '<ol class="mb-0 small">';
        trilha.cursos.forEach(tc => {
          const nomeCurso = tc.curso ? tc.curso.titulo : 'Curso removido';
          cursosHtml += `
            <li class="d-flex justify-content-between align-items-center">
              ${nomeCurso}
              <button class="btn btn-sm btn-link text-danger p-0" onclick="removerCursoDaTrilha(${trilha.id}, ${tc.idCurso})">
                <i class="bi bi-x-lg"></i>
              </button>
            </li>`;
        });
        cursosHtml += '</ol>';
      } else {
        cursosHtml = '<p class="text-muted small mb-0">Nenhum curso na trilha</p>';
      }

      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><strong>${trilha.titulo}</strong></span>
            <span class="badge bg-secondary">${nomeCategoria}</span>
          </div>
          <div class="card-body">
            <p class="text-muted small">${trilha.descricao || 'Sem descrição'}</p>
            <h6 class="mb-2">Cursos da Trilha:</h6>
            ${cursosHtml}
          </div>
          <div class="card-footer bg-transparent">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalAdicionarCursoTrilha(${trilha.id})">
              <i class="bi bi-plus-lg me-1"></i>Adicionar Curso
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="removerTrilha(${trilha.id})">
              <i class="bi bi-trash me-1"></i>Remover
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar trilhas: ' + erro.message, 'danger');
  }
}

async function salvarTrilha(event) {
  event.preventDefault();

  const titulo = document.getElementById('trilhaTitulo').value.trim();
  const descricao = document.getElementById('trilhaDescricao').value.trim();
  const idCategoria = document.getElementById('trilhaCategoria').value;

  if (!titulo || !idCategoria) {
    exibirToast('Preencha os campos obrigatórios', 'warning');
    return;
  }

  try {
    await api.post('trilhas', { titulo, descricao, idCategoria });
    fecharModal('modalTrilha');
    document.getElementById('formTrilha').reset();
    carregarTrilhas();
    exibirToast('Trilha criada');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerTrilha(id) {
  if (!confirm('Remover esta trilha?')) return;
  try {
    await api.delete(`trilhas/${id}`);
    carregarTrilhas();
    exibirToast('Trilha removida');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

function abrirModalAdicionarCursoTrilha(idTrilha) {
  document.getElementById('trilhaCursoIdTrilha').value = idTrilha;
  popularSelectCursos();
  const modal = new bootstrap.Modal(document.getElementById('modalTrilhaCurso'));
  modal.show();
}

async function adicionarCursoTrilha(event) {
  event.preventDefault();

  const idTrilha = document.getElementById('trilhaCursoIdTrilha').value;
  const idCurso = document.getElementById('trilhaCursoCurso').value;

  if (!idCurso) {
    exibirToast('Selecione um curso', 'warning');
    return;
  }

  try {
    await api.post(`trilhas/${idTrilha}/cursos`, { idCurso });
    fecharModal('modalTrilhaCurso');
    carregarTrilhas();
    exibirToast('Curso adicionado à trilha');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerCursoDaTrilha(idTrilha, idCurso) {
  try {
    await api.delete(`trilhas/${idTrilha}/cursos/${idCurso}`);
    carregarTrilhas();
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

// ===== CERTIFICADOS =====

async function carregarCertificados() {
  try {
    const certificados = await api.get('certificados');
    const tbody = document.getElementById('tabelaCertificados');
    tbody.innerHTML = '';

    if (certificados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum certificado emitido</td></tr>';
      return;
    }

    certificados.forEach(c => {
      const nomeUsuario = c.usuario ? c.usuario.nomeCompleto : 'N/A';
      const nomeCurso = c.curso ? c.curso.titulo : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nomeUsuario}</td>
        <td>${nomeCurso}</td>
        <td><code>${c.codigoVerificacao}</code></td>
        <td>${formatarData(c.dataEmissao)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar certificados: ' + erro.message, 'danger');
  }
}

async function gerarCertificado() {
  const idUsuario = document.getElementById('selectUsuarioCert').value;
  const idCurso = document.getElementById('selectCursoCert').value;

  if (!idUsuario || !idCurso) {
    exibirToast('Selecione aluno e curso', 'warning');
    return;
  }

  try {
    const cert = await api.post('certificados', { idUsuario, idCurso });
    const nomeAluno = cert.usuario ? cert.usuario.nomeCompleto : 'Aluno';
    const nomeCurso = cert.curso ? cert.curso.titulo : 'Curso';

    const container = document.getElementById('certificadoGerado');
    container.style.display = 'block';
    container.innerHTML = `
      <div class="certificado-container mb-4">
        <p class="text-muted mb-1">CERTIFICADO DE CONCLUSÃO</p>
        <hr>
        <h3 class="my-3">EduPlataforma</h3>
        <p class="fs-5">Certificamos que</p>
        <h4 class="text-dark my-2">${nomeAluno}</h4>
        <p class="fs-5">concluiu com êxito o curso</p>
        <h4 class="my-2">${nomeCurso}</h4>
        <hr>
        <p class="certificado-codigo mt-3">Código: ${cert.codigoVerificacao}</p>
        <p class="small text-muted">Emitido em ${formatarData(cert.dataEmissao)}</p>
      </div>
    `;

    carregarCertificados();
    exibirToast('Certificado gerado com sucesso');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function verificarCertificado() {
  const codigo = document.getElementById('codigoVerificacao').value.trim();
  const container = document.getElementById('resultadoVerificacao');

  if (!codigo) {
    exibirToast('Informe o código de verificação', 'warning');
    return;
  }

  try {
    const resultado = await api.get(`certificados/verificar/${codigo}`);
    const nomeAluno = resultado.usuario ? resultado.usuario.nomeCompleto : 'N/A';
    const nomeCurso = resultado.curso ? resultado.curso.titulo : 'N/A';

    container.innerHTML = `
      <div class="alert alert-success">
        <i class="bi bi-check-circle-fill me-2"></i><strong>Certificado válido!</strong>
        <hr>
        <p class="mb-1"><strong>Aluno:</strong> ${nomeAluno}</p>
        <p class="mb-1"><strong>Curso:</strong> ${nomeCurso}</p>
        <p class="mb-0"><strong>Emitido em:</strong> ${formatarData(resultado.dataEmissao)}</p>
      </div>
    `;
  } catch (erro) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-x-circle-fill me-2"></i>Certificado não encontrado. Verifique o código.
      </div>
    `;
  }
}
