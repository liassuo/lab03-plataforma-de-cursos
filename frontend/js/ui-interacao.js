// ===== MATRÍCULAS =====

async function carregarMatriculas() {
  try {
    const matriculas = await api.get('matriculas');
    const tbody = document.getElementById('tabelaMatriculas');
    tbody.innerHTML = '';

    if (matriculas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma matrícula registrada</td></tr>';
      return;
    }

    matriculas.forEach(m => {
      const nomeAluno = m.usuario ? m.usuario.nomeCompleto : 'N/A';
      const nomeCurso = m.curso ? m.curso.titulo : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.id}</td>
        <td>${nomeAluno}</td>
        <td>${nomeCurso}</td>
        <td>${formatarData(m.dataMatricula)}</td>
        <td>${m.dataConclusao ? formatarData(m.dataConclusao) : '<span class="badge bg-info">Em andamento</span>'}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="removerMatricula(${m.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar matrículas: ' + erro.message, 'danger');
  }
}

async function salvarMatricula(event) {
  event.preventDefault();

  const idUsuario = document.getElementById('matriculaUsuario').value;
  const idCurso = document.getElementById('matriculaCurso').value;

  if (!idUsuario || !idCurso) {
    exibirToast('Selecione aluno e curso', 'warning');
    return;
  }

  try {
    await api.post('matriculas', { idUsuario, idCurso });
    fecharModal('modalMatricula');
    document.getElementById('formMatricula').reset();
    carregarMatriculas();
    atualizarPainel();
    exibirToast('Matrícula realizada com sucesso');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerMatricula(id) {
  if (!confirm('Deseja cancelar esta matrícula?')) return;
  try {
    await api.delete(`matriculas/${id}`);
    carregarMatriculas();
    atualizarPainel();
    exibirToast('Matrícula cancelada');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

// ===== PROGRESSO =====

async function carregarProgresso() {
  const idUsuario = document.getElementById('selectUsuarioProgresso').value;
  const idCurso = document.getElementById('selectCursoProgresso').value;

  if (!idUsuario || !idCurso) {
    exibirToast('Selecione aluno e curso', 'warning');
    return;
  }

  try {
    const resumo = await api.get(`progresso/resumo/${idUsuario}/${idCurso}`);
    const curso = await api.get(`cursos/${idCurso}`);
    const progressoAulas = await api.get(`progresso?idUsuario=${idUsuario}&idCurso=${idCurso}`);

    const painel = document.getElementById('painelProgresso');
    painel.style.display = 'block';

    document.getElementById('barraProgresso').style.width = resumo.percentual + '%';
    document.getElementById('textoProgresso').textContent =
      `${resumo.concluidas} de ${resumo.totalAulas} aulas concluídas (${resumo.percentual}%)`;

    const aulasConcluidasIds = progressoAulas
      .filter(p => p.status === 'Concluido')
      .map(p => p.idAula);

    const container = document.getElementById('listaAulasProgresso');
    container.innerHTML = '';

    if (!curso.modulos || curso.modulos.length === 0) {
      container.innerHTML = '<p class="text-muted">Este curso não possui módulos/aulas</p>';
      return;
    }

    curso.modulos.forEach(modulo => {
      const divModulo = document.createElement('div');
      divModulo.className = 'card mb-2';

      let aulasHtml = '';
      if (modulo.aulas && modulo.aulas.length > 0) {
        modulo.aulas.forEach(aula => {
          const concluida = aulasConcluidasIds.includes(aula.id);
          aulasHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <i class="bi ${concluida ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2"></i>
                ${aula.ordem}. ${aula.titulo}
              </span>
              <button class="btn btn-sm ${concluida ? 'btn-success' : 'btn-outline-secondary'}"
                      onclick="alternarProgresso(${idUsuario}, ${aula.id}, ${concluida}, ${idCurso})">
                ${concluida ? 'Concluída' : 'Marcar'}
              </button>
            </li>
          `;
        });
      }

      divModulo.innerHTML = `
        <div class="card-header bg-light py-2">
          <small class="fw-bold">Módulo ${modulo.ordem}: ${modulo.titulo}</small>
        </div>
        <ul class="list-group list-group-flush">${aulasHtml}</ul>
      `;
      container.appendChild(divModulo);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar progresso: ' + erro.message, 'danger');
  }
}

async function alternarProgresso(idUsuario, idAula, jaConcluida, idCurso) {
  try {
    if (jaConcluida) {
      await api.delete(`progresso/${idUsuario}/${idAula}`);
    } else {
      await api.post('progresso', { idUsuario, idAula, status: 'Concluido' });
    }
    carregarProgresso();
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

// ===== AVALIAÇÕES =====

async function carregarAvaliacoes() {
  try {
    const avaliacoes = await api.get('avaliacoes');
    const tbody = document.getElementById('tabelaAvaliacoes');
    tbody.innerHTML = '';

    if (avaliacoes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma avaliação registrada</td></tr>';
      return;
    }

    avaliacoes.forEach(a => {
      const nomeUsuario = a.usuario ? a.usuario.nomeCompleto : 'N/A';
      const nomeCurso = a.curso ? a.curso.titulo : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nomeUsuario}</td>
        <td>${nomeCurso}</td>
        <td>${renderizarEstrelas(a.nota)}</td>
        <td>${a.comentario || '-'}</td>
        <td>${formatarData(a.dataAvaliacao)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="removerAvaliacao(${a.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar avaliações: ' + erro.message, 'danger');
  }
}

function renderizarEstrelas(nota) {
  let html = '<span class="estrelas">';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="bi ${i <= nota ? 'bi-star-fill' : 'bi-star'}"></i>`;
  }
  html += '</span>';
  return html;
}

async function salvarAvaliacao(event) {
  event.preventDefault();

  const idUsuario = document.getElementById('avaliacaoUsuario').value;
  const idCurso = document.getElementById('avaliacaoCurso').value;
  const nota = document.getElementById('avaliacaoNota').value;
  const comentario = document.getElementById('avaliacaoComentario').value.trim();

  if (!idUsuario || !idCurso || !nota) {
    exibirToast('Preencha os campos obrigatórios', 'warning');
    return;
  }

  try {
    await api.post('avaliacoes', { idUsuario, idCurso, nota, comentario });
    fecharModal('modalAvaliacao');
    document.getElementById('formAvaliacao').reset();
    carregarAvaliacoes();
    exibirToast('Avaliação registrada');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerAvaliacao(id) {
  if (!confirm('Remover esta avaliação?')) return;
  try {
    await api.delete(`avaliacoes/${id}`);
    carregarAvaliacoes();
    exibirToast('Avaliação removida');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}
