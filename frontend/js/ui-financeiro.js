// ===== PLANOS =====

async function carregarPlanos() {
  try {
    const planos = await api.get('planos');
    const container = document.getElementById('listaPlanosCards');
    container.innerHTML = '';

    planos.forEach(plano => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card plano-card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">${plano.nome}</h5>
            <p class="text-muted small">${plano.descricao || ''}</p>
            <p class="plano-preco">
              R$ ${plano.preco.toFixed(2).replace('.', ',')}
              <small>/${plano.duracaoMeses} ${plano.duracaoMeses === 1 ? 'mês' : 'meses'}</small>
            </p>
          </div>
          <div class="card-footer bg-transparent">
            <button class="btn btn-sm btn-outline-danger" onclick="removerPlano(${plano.id})">
              <i class="bi bi-trash me-1"></i>Remover
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

    popularSelectPlanos();
  } catch (erro) {
    exibirToast('Erro ao carregar planos: ' + erro.message, 'danger');
  }
}

async function salvarPlano(event) {
  event.preventDefault();

  const nome = document.getElementById('planoNome').value.trim();
  const descricao = document.getElementById('planoDescricao').value.trim();
  const preco = document.getElementById('planoPreco').value;
  const duracaoMeses = document.getElementById('planoDuracao').value;

  if (!nome || !preco || !duracaoMeses) {
    exibirToast('Preencha os campos obrigatórios', 'warning');
    return;
  }

  try {
    await api.post('planos', { nome, descricao, preco, duracaoMeses });
    fecharModal('modalPlano');
    document.getElementById('formPlano').reset();
    carregarPlanos();
    exibirToast('Plano criado');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function removerPlano(id) {
  if (!confirm('Remover este plano?')) return;
  try {
    await api.delete(`planos/${id}`);
    carregarPlanos();
    exibirToast('Plano removido');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function popularSelectPlanos() {
  try {
    const planos = await api.get('planos');
    const sel = document.getElementById('selectPlanoAssinatura');
    if (!sel) return;
    const primeiraOpcao = sel.options[0].outerHTML;
    sel.innerHTML = primeiraOpcao;
    planos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nome} - R$ ${p.preco.toFixed(2).replace('.', ',')}`;
      sel.appendChild(opt);
    });
  } catch (erro) {
    console.error('Erro ao popular planos:', erro);
  }
}

// ===== ASSINATURAS =====

async function simularAssinatura() {
  const idUsuario = document.getElementById('selectUsuarioAssinatura').value;
  const idPlano = document.getElementById('selectPlanoAssinatura').value;
  const metodoPagamento = document.getElementById('selectMetodoPagamento').value;

  if (!idUsuario || !idPlano) {
    exibirToast('Selecione usuário e plano', 'warning');
    return;
  }

  try {
    const assinatura = await api.post('assinaturas', { idUsuario, idPlano });
    await api.post('pagamentos', { idAssinatura: assinatura.id, metodoPagamento });

    carregarAssinaturas();
    carregarPagamentos();
    exibirToast('Assinatura realizada e pagamento registrado!');
  } catch (erro) {
    exibirToast(erro.message, 'danger');
  }
}

async function carregarAssinaturas() {
  try {
    const assinaturas = await api.get('assinaturas');
    const tbody = document.getElementById('tabelaAssinaturas');
    tbody.innerHTML = '';

    if (assinaturas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma assinatura</td></tr>';
      return;
    }

    assinaturas.forEach(a => {
      const nomeUsuario = a.usuario ? a.usuario.nomeCompleto : 'N/A';
      const nomePlano = a.plano ? a.plano.nome : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nomeUsuario}</td>
        <td>${nomePlano}</td>
        <td>${formatarData(a.dataInicio)}</td>
        <td>${formatarData(a.dataFim)}</td>
        <td><span class="badge bg-success">${a.status || 'Ativa'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar assinaturas: ' + erro.message, 'danger');
  }
}

// ===== PAGAMENTOS =====

async function carregarPagamentos() {
  try {
    const pagamentos = await api.get('pagamentos');
    const tbody = document.getElementById('tabelaPagamentos');
    tbody.innerHTML = '';

    if (pagamentos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum pagamento registrado</td></tr>';
      return;
    }

    pagamentos.forEach(p => {
      const infoAssinatura = p.assinatura ? `#${p.assinatura.id}` : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${infoAssinatura}</td>
        <td>R$ ${p.valorPago.toFixed(2).replace('.', ',')}</td>
        <td>${p.metodoPagamento}</td>
        <td><code class="small">${p.idTransacaoGateway}</code></td>
        <td>${formatarData(p.dataPagamento)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    exibirToast('Erro ao carregar pagamentos: ' + erro.message, 'danger');
  }
}
