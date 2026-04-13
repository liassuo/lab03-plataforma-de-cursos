// ===== STORE LOCAL (localStorage) =====

const LS_PREFIX = 'edu_';

class LocalStore {
  constructor() {
    if (!localStorage.getItem(LS_PREFIX + 'inicializado')) {
      this._carregarDadosIniciais();
      localStorage.setItem(LS_PREFIX + 'inicializado', '1');
    }
  }

  // --- Acesso generico a colecoes ---

  _ler(colecao) {
    return JSON.parse(localStorage.getItem(LS_PREFIX + colecao) || '[]');
  }

  _salvar(colecao, dados) {
    localStorage.setItem(LS_PREFIX + colecao, JSON.stringify(dados));
  }

  _proximoId(colecao) {
    const chave = LS_PREFIX + 'seq_' + colecao;
    const atual = parseInt(localStorage.getItem(chave) || '0', 10) + 1;
    localStorage.setItem(chave, String(atual));
    return atual;
  }

  // --- Helpers de relacao ---

  _usuario(id) {
    const u = this._ler('usuarios').find(u => u.id === id);
    if (!u) return undefined;
    const { senhaHash, ...semSenha } = u;
    return semSenha;
  }

  _categoria(id) {
    return this._ler('categorias').find(c => c.id === id);
  }

  _curso(id) {
    return this._ler('cursos').find(c => c.id === id);
  }

  _plano(id) {
    return this._ler('planos').find(p => p.id === id);
  }

  _recalcularTotaisCurso(idModulo) {
    const modulo = this._ler('modulos').find(m => m.id === idModulo);
    if (!modulo) return;

    const cursos = this._ler('cursos');
    const curso = cursos.find(c => c.id === modulo.idCurso);
    if (!curso) return;

    const modulosDoCurso = this._ler('modulos').filter(m => m.idCurso === curso.id);
    const idsModulos = modulosDoCurso.map(m => m.id);
    const todasAulas = this._ler('aulas').filter(a => idsModulos.includes(a.idModulo));

    curso.totalAulas = todasAulas.length;
    curso.totalHoras = Math.round((todasAulas.reduce((acc, a) => acc + a.duracaoMinutos, 0) / 60) * 10) / 10;
    this._salvar('cursos', cursos);
  }

  // --- Dados iniciais (seed) ---

  _carregarDadosIniciais() {
    const categorias = [
      { id: 1, nome: 'Desenvolvimento Web', descricao: 'Cursos de programacao web front e backend' },
      { id: 2, nome: 'Data Science', descricao: 'Analise de dados, machine learning e estatistica' },
      { id: 3, nome: 'Design', descricao: 'UI/UX, design grafico e prototipacao' },
    ];
    this._salvar('categorias', categorias);
    localStorage.setItem(LS_PREFIX + 'seq_categorias', '3');

    const usuarios = [
      { id: 1, nomeCompleto: 'Carlos Silva', email: 'carlos@email.com', senhaHash: 'abc123', dataCadastro: '2025-01-15' },
      { id: 2, nomeCompleto: 'Ana Souza', email: 'ana@email.com', senhaHash: 'def456', dataCadastro: '2025-02-10' },
      { id: 3, nomeCompleto: 'Prof. Marcos Lima', email: 'marcos@email.com', senhaHash: 'ghi789', dataCadastro: '2024-11-01' },
    ];
    this._salvar('usuarios', usuarios);
    localStorage.setItem(LS_PREFIX + 'seq_usuarios', '3');

    const cursos = [
      { id: 1, titulo: 'JavaScript do Zero ao Avancado', descricao: 'Aprenda JS desde o basico ate conceitos avancados', idInstrutor: 3, idCategoria: 1, nivel: 'Iniciante', dataPublicacao: '2025-03-01', totalAulas: 0, totalHoras: 0 },
      { id: 2, titulo: 'Python para Data Science', descricao: 'Fundamentos de Python aplicados a ciencia de dados', idInstrutor: 3, idCategoria: 2, nivel: 'Intermediario', dataPublicacao: '2025-04-01', totalAulas: 0, totalHoras: 0 },
    ];
    this._salvar('cursos', cursos);
    localStorage.setItem(LS_PREFIX + 'seq_cursos', '2');

    const planos = [
      { id: 1, nome: 'Basico', descricao: 'Acesso a 3 cursos por mes', preco: 29.90, duracaoMeses: 1 },
      { id: 2, nome: 'Pro', descricao: 'Acesso ilimitado a todos os cursos', preco: 59.90, duracaoMeses: 6 },
      { id: 3, nome: 'Premium', descricao: 'Acesso ilimitado + certificados + suporte', preco: 99.90, duracaoMeses: 12 },
    ];
    this._salvar('planos', planos);
    localStorage.setItem(LS_PREFIX + 'seq_planos', '3');

    // Colecoes vazias
    ['modulos', 'aulas', 'matriculas', 'progressoAulas', 'avaliacoes',
     'trilhas', 'trilhasCursos', 'certificados', 'assinaturas', 'pagamentos'].forEach(col => {
      this._salvar(col, []);
      localStorage.setItem(LS_PREFIX + 'seq_' + col, '0');
    });
  }
}

const store = new LocalStore();

// ===== ROTEADOR DE API =====

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function parseRoute(recurso) {
  const [caminhoCompleto, queryString] = recurso.split('?');
  const partes = caminhoCompleto.split('/');
  const params = {};

  if (queryString) {
    queryString.split('&').forEach(par => {
      const [k, v] = par.split('=');
      params[k] = decodeURIComponent(v);
    });
  }

  return { partes, params };
}

// --- GET handlers ---

const getHandlers = {
  usuarios(partes) {
    if (partes[1]) {
      const u = store._ler('usuarios').find(u => u.id === +partes[1]);
      if (!u) throw new Error('Usuario nao encontrado');
      const { senhaHash, ...semSenha } = u;
      return semSenha;
    }
    return store._ler('usuarios').map(u => {
      const { senhaHash, ...semSenha } = u;
      return semSenha;
    });
  },

  categorias(partes) {
    if (partes[1]) {
      const c = store._ler('categorias').find(c => c.id === +partes[1]);
      if (!c) throw new Error('Categoria nao encontrada');
      return c;
    }
    return store._ler('categorias');
  },

  cursos(partes) {
    if (partes[1]) {
      const curso = store._ler('cursos').find(c => c.id === +partes[1]);
      if (!curso) throw new Error('Curso nao encontrado');

      const modulos = store._ler('modulos')
        .filter(m => m.idCurso === curso.id)
        .sort((a, b) => a.ordem - b.ordem)
        .map(modulo => ({
          ...modulo,
          aulas: store._ler('aulas')
            .filter(a => a.idModulo === modulo.id)
            .sort((a, b) => a.ordem - b.ordem),
        }));

      return {
        ...curso,
        categoria: store._categoria(curso.idCategoria),
        instrutor: store._usuario(curso.idInstrutor),
        modulos,
      };
    }
    return store._ler('cursos').map(curso => ({
      ...curso,
      categoria: store._categoria(curso.idCategoria),
      instrutor: store._usuario(curso.idInstrutor),
    }));
  },

  modulos(partes) {
    if (partes[1]) {
      const modulo = store._ler('modulos').find(m => m.id === +partes[1]);
      if (!modulo) throw new Error('Modulo nao encontrado');
      const aulas = store._ler('aulas').filter(a => a.idModulo === modulo.id).sort((a, b) => a.ordem - b.ordem);
      return { ...modulo, aulas };
    }
    return store._ler('modulos').map(m => ({
      ...m,
      curso: store._curso(m.idCurso),
    }));
  },

  aulas(partes) {
    if (partes[1]) {
      const aula = store._ler('aulas').find(a => a.id === +partes[1]);
      if (!aula) throw new Error('Aula nao encontrada');
      return aula;
    }
    return store._ler('aulas').map(a => ({
      ...a,
      modulo: store._ler('modulos').find(m => m.id === a.idModulo),
    }));
  },

  matriculas(partes) {
    if (partes[1]) {
      const m = store._ler('matriculas').find(m => m.id === +partes[1]);
      if (!m) throw new Error('Matricula nao encontrada');
      return { ...m, usuario: store._usuario(m.idUsuario), curso: store._curso(m.idCurso) };
    }
    return store._ler('matriculas').map(m => ({
      ...m,
      usuario: store._usuario(m.idUsuario),
      curso: store._curso(m.idCurso),
    }));
  },

  progresso(partes, params) {
    // GET progresso/resumo/{idUsuario}/{idCurso}
    if (partes[1] === 'resumo') {
      const idUsuario = +partes[2];
      const idCurso = +partes[3];

      const modulosDoCurso = store._ler('modulos').filter(m => m.idCurso === idCurso);
      const idsModulos = modulosDoCurso.map(m => m.id);
      const totalAulas = store._ler('aulas').filter(a => idsModulos.includes(a.idModulo)).length;
      const aulasIds = store._ler('aulas').filter(a => idsModulos.includes(a.idModulo)).map(a => a.id);

      const concluidas = store._ler('progressoAulas').filter(
        p => p.idUsuario === idUsuario && aulasIds.includes(p.idAula) && p.status === 'Concluido'
      ).length;

      const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;
      return { totalAulas, concluidas, percentual };
    }

    // GET progresso?idUsuario=X&idCurso=Y
    let resultado = store._ler('progressoAulas');

    if (params.idUsuario) {
      resultado = resultado.filter(p => p.idUsuario === +params.idUsuario);
    }
    if (params.idCurso) {
      const modulosDoCurso = store._ler('modulos').filter(m => m.idCurso === +params.idCurso);
      const idsModulos = modulosDoCurso.map(m => m.id);
      const aulasIds = store._ler('aulas').filter(a => idsModulos.includes(a.idModulo)).map(a => a.id);
      resultado = resultado.filter(p => aulasIds.includes(p.idAula));
    }
    return resultado;
  },

  avaliacoes(partes) {
    if (partes[1]) {
      const a = store._ler('avaliacoes').find(a => a.id === +partes[1]);
      if (!a) throw new Error('Avaliacao nao encontrada');
      return a;
    }
    return store._ler('avaliacoes').map(a => ({
      ...a,
      usuario: store._usuario(a.idUsuario),
      curso: store._curso(a.idCurso),
    }));
  },

  trilhas(partes) {
    const buscarCursosDaTrilha = (idTrilha) => {
      return store._ler('trilhasCursos')
        .filter(tc => tc.idTrilha === idTrilha)
        .sort((a, b) => a.ordem - b.ordem)
        .map(tc => ({
          ...tc,
          curso: store._curso(tc.idCurso),
        }));
    };

    if (partes[1]) {
      const trilha = store._ler('trilhas').find(t => t.id === +partes[1]);
      if (!trilha) throw new Error('Trilha nao encontrada');
      return {
        ...trilha,
        categoria: store._categoria(trilha.idCategoria),
        cursos: buscarCursosDaTrilha(trilha.id),
      };
    }
    return store._ler('trilhas').map(t => ({
      ...t,
      categoria: store._categoria(t.idCategoria),
      cursos: buscarCursosDaTrilha(t.id),
    }));
  },

  certificados(partes) {
    // GET certificados/verificar/{codigo}
    if (partes[1] === 'verificar') {
      const cert = store._ler('certificados').find(c => c.codigoVerificacao === partes[2]);
      if (!cert) throw new Error('Certificado nao encontrado');
      return {
        ...cert,
        usuario: store._usuario(cert.idUsuario),
        curso: store._curso(cert.idCurso),
        valido: true,
      };
    }

    if (partes[1]) {
      const c = store._ler('certificados').find(c => c.id === +partes[1]);
      if (!c) throw new Error('Certificado nao encontrado');
      return c;
    }
    return store._ler('certificados').map(c => ({
      ...c,
      usuario: store._usuario(c.idUsuario),
      curso: store._curso(c.idCurso),
      trilha: c.idTrilha ? store._ler('trilhas').find(t => t.id === c.idTrilha) : null,
    }));
  },

  planos(partes) {
    if (partes[1]) {
      const p = store._ler('planos').find(p => p.id === +partes[1]);
      if (!p) throw new Error('Plano nao encontrado');
      return p;
    }
    return store._ler('planos');
  },

  assinaturas(partes) {
    if (partes[1]) {
      const a = store._ler('assinaturas').find(a => a.id === +partes[1]);
      if (!a) throw new Error('Assinatura nao encontrada');
      return { ...a, usuario: store._usuario(a.idUsuario), plano: store._plano(a.idPlano) };
    }
    return store._ler('assinaturas').map(a => ({
      ...a,
      usuario: store._usuario(a.idUsuario),
      plano: store._plano(a.idPlano),
    }));
  },

  pagamentos(partes) {
    if (partes[1]) {
      const p = store._ler('pagamentos').find(p => p.id === +partes[1]);
      if (!p) throw new Error('Pagamento nao encontrado');
      return p;
    }
    return store._ler('pagamentos').map(p => ({
      ...p,
      assinatura: store._ler('assinaturas').find(a => a.id === p.idAssinatura),
    }));
  },
};

// --- POST handlers ---

const postHandlers = {
  usuarios(partes, dados) {
    const usuarios = store._ler('usuarios');
    if (usuarios.find(u => u.email === dados.email)) {
      throw new Error('Email ja cadastrado');
    }
    const novo = {
      id: store._proximoId('usuarios'),
      nomeCompleto: dados.nomeCompleto,
      email: dados.email,
      senhaHash: dados.senha || 'hash_simulado',
      dataCadastro: hoje(),
    };
    usuarios.push(novo);
    store._salvar('usuarios', usuarios);
    const { senhaHash, ...semSenha } = novo;
    return semSenha;
  },

  categorias(partes, dados) {
    const categorias = store._ler('categorias');
    if (categorias.find(c => c.nome === dados.nome)) {
      throw new Error('Ja existe uma categoria com esse nome');
    }
    const nova = {
      id: store._proximoId('categorias'),
      nome: dados.nome,
      descricao: dados.descricao || '',
    };
    categorias.push(nova);
    store._salvar('categorias', categorias);
    return nova;
  },

  cursos(partes, dados) {
    const cursos = store._ler('cursos');
    const novo = {
      id: store._proximoId('cursos'),
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      idInstrutor: +dados.idInstrutor,
      idCategoria: +dados.idCategoria,
      nivel: dados.nivel || 'Iniciante',
      dataPublicacao: dados.dataPublicacao || hoje(),
      totalAulas: 0,
      totalHoras: 0,
    };
    cursos.push(novo);
    store._salvar('cursos', cursos);
    return novo;
  },

  modulos(partes, dados) {
    const modulos = store._ler('modulos');
    const modulosDoCurso = modulos.filter(m => m.idCurso === +dados.idCurso);
    const proximaOrdem = modulosDoCurso.length > 0
      ? Math.max(...modulosDoCurso.map(m => m.ordem)) + 1
      : 1;

    const novo = {
      id: store._proximoId('modulos'),
      idCurso: +dados.idCurso,
      titulo: dados.titulo,
      ordem: dados.ordem ? +dados.ordem : proximaOrdem,
    };
    modulos.push(novo);
    store._salvar('modulos', modulos);
    return novo;
  },

  aulas(partes, dados) {
    const aulas = store._ler('aulas');
    const aulasDoModulo = aulas.filter(a => a.idModulo === +dados.idModulo);
    const proximaOrdem = aulasDoModulo.length > 0
      ? Math.max(...aulasDoModulo.map(a => a.ordem)) + 1
      : 1;

    const nova = {
      id: store._proximoId('aulas'),
      idModulo: +dados.idModulo,
      titulo: dados.titulo,
      tipoConteudo: dados.tipoConteudo || 'Video',
      urlConteudo: dados.urlConteudo || '',
      duracaoMinutos: +dados.duracaoMinutos || 0,
      ordem: dados.ordem ? +dados.ordem : proximaOrdem,
    };
    aulas.push(nova);
    store._salvar('aulas', aulas);
    store._recalcularTotaisCurso(+dados.idModulo);
    return nova;
  },

  matriculas(partes, dados) {
    const matriculas = store._ler('matriculas');
    if (matriculas.find(m => m.idUsuario === +dados.idUsuario && m.idCurso === +dados.idCurso)) {
      throw new Error('Usuario ja matriculado neste curso');
    }
    const nova = {
      id: store._proximoId('matriculas'),
      idUsuario: +dados.idUsuario,
      idCurso: +dados.idCurso,
      dataMatricula: hoje(),
      dataConclusao: null,
    };
    matriculas.push(nova);
    store._salvar('matriculas', matriculas);
    return nova;
  },

  progresso(partes, dados) {
    const progressos = store._ler('progressoAulas');
    const existente = progressos.find(
      p => p.idUsuario === +dados.idUsuario && p.idAula === +dados.idAula
    );

    if (existente) {
      existente.status = dados.status || 'Concluido';
      existente.dataConclusao = hoje();
      store._salvar('progressoAulas', progressos);
      return existente;
    }

    const novo = {
      idUsuario: +dados.idUsuario,
      idAula: +dados.idAula,
      dataConclusao: hoje(),
      status: dados.status || 'Concluido',
    };
    progressos.push(novo);
    store._salvar('progressoAulas', progressos);
    return novo;
  },

  avaliacoes(partes, dados) {
    const avaliacoes = store._ler('avaliacoes');
    if (avaliacoes.find(a => a.idUsuario === +dados.idUsuario && a.idCurso === +dados.idCurso)) {
      throw new Error('Usuario ja avaliou este curso');
    }
    const nova = {
      id: store._proximoId('avaliacoes'),
      idUsuario: +dados.idUsuario,
      idCurso: +dados.idCurso,
      nota: +dados.nota,
      comentario: dados.comentario || null,
      dataAvaliacao: hoje(),
    };
    avaliacoes.push(nova);
    store._salvar('avaliacoes', avaliacoes);
    return nova;
  },

  trilhas(partes, dados) {
    // POST trilhas/{id}/cursos
    if (partes[1] && partes[2] === 'cursos') {
      const idTrilha = +partes[1];
      const trilhasCursos = store._ler('trilhasCursos');

      if (trilhasCursos.find(tc => tc.idTrilha === idTrilha && tc.idCurso === +dados.idCurso)) {
        throw new Error('Curso ja esta na trilha');
      }

      const cursosDaTrilha = trilhasCursos.filter(tc => tc.idTrilha === idTrilha);
      const proximaOrdem = cursosDaTrilha.length > 0
        ? Math.max(...cursosDaTrilha.map(tc => tc.ordem)) + 1
        : 1;

      const vinculo = {
        idTrilha,
        idCurso: +dados.idCurso,
        ordem: dados.ordem ? +dados.ordem : proximaOrdem,
      };
      trilhasCursos.push(vinculo);
      store._salvar('trilhasCursos', trilhasCursos);
      return vinculo;
    }

    // POST trilhas
    const trilhas = store._ler('trilhas');
    const nova = {
      id: store._proximoId('trilhas'),
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      idCategoria: +dados.idCategoria,
    };
    trilhas.push(nova);
    store._salvar('trilhas', trilhas);
    return nova;
  },

  certificados(partes, dados) {
    const certificados = store._ler('certificados');
    if (certificados.find(c => c.idUsuario === +dados.idUsuario && c.idCurso === +dados.idCurso)) {
      throw new Error('Certificado ja emitido para este curso');
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'CERT-';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const novo = {
      id: store._proximoId('certificados'),
      idUsuario: +dados.idUsuario,
      idCurso: +dados.idCurso,
      idTrilha: dados.idTrilha ? +dados.idTrilha : null,
      codigoVerificacao: codigo,
      dataEmissao: hoje(),
    };
    certificados.push(novo);
    store._salvar('certificados', certificados);

    return {
      ...novo,
      usuario: store._usuario(novo.idUsuario),
      curso: store._curso(novo.idCurso),
    };
  },

  planos(partes, dados) {
    const planos = store._ler('planos');
    const novo = {
      id: store._proximoId('planos'),
      nome: dados.nome,
      descricao: dados.descricao || '',
      preco: +dados.preco,
      duracaoMeses: +dados.duracaoMeses,
    };
    planos.push(novo);
    store._salvar('planos', planos);
    return novo;
  },

  assinaturas(partes, dados) {
    const plano = store._plano(+dados.idPlano);
    if (!plano) throw new Error('Plano nao encontrado');

    const dataInicio = new Date();
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + plano.duracaoMeses);

    const assinaturas = store._ler('assinaturas');
    const nova = {
      id: store._proximoId('assinaturas'),
      idUsuario: +dados.idUsuario,
      idPlano: +dados.idPlano,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0],
      status: 'Ativa',
    };
    assinaturas.push(nova);
    store._salvar('assinaturas', assinaturas);
    return nova;
  },

  pagamentos(partes, dados) {
    const assinatura = store._ler('assinaturas').find(a => a.id === +dados.idAssinatura);
    if (!assinatura) throw new Error('Assinatura nao encontrada');

    const plano = store._plano(assinatura.idPlano);
    const transacaoId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const pagamentos = store._ler('pagamentos');
    const novo = {
      id: store._proximoId('pagamentos'),
      idAssinatura: +dados.idAssinatura,
      valorPago: plano ? plano.preco : +dados.valorPago,
      dataPagamento: hoje(),
      metodoPagamento: dados.metodoPagamento || 'Cartao de Credito',
      idTransacaoGateway: transacaoId,
    };
    pagamentos.push(novo);
    store._salvar('pagamentos', pagamentos);
    return novo;
  },
};

// --- PUT handlers ---

const putHandlers = {
  usuarios(partes, dados) {
    const usuarios = store._ler('usuarios');
    const usuario = usuarios.find(u => u.id === +partes[1]);
    if (!usuario) throw new Error('Usuario nao encontrado');
    if (dados.nomeCompleto) usuario.nomeCompleto = dados.nomeCompleto;
    if (dados.email) usuario.email = dados.email;
    store._salvar('usuarios', usuarios);
    const { senhaHash, ...semSenha } = usuario;
    return semSenha;
  },

  categorias(partes, dados) {
    const categorias = store._ler('categorias');
    const cat = categorias.find(c => c.id === +partes[1]);
    if (!cat) throw new Error('Categoria nao encontrada');
    if (dados.nome) cat.nome = dados.nome;
    if (dados.descricao !== undefined) cat.descricao = dados.descricao;
    store._salvar('categorias', categorias);
    return cat;
  },

  cursos(partes, dados) {
    const cursos = store._ler('cursos');
    const curso = cursos.find(c => c.id === +partes[1]);
    if (!curso) throw new Error('Curso nao encontrado');
    Object.assign(curso, {
      titulo: dados.titulo ?? curso.titulo,
      descricao: dados.descricao ?? curso.descricao,
      idInstrutor: dados.idInstrutor ? +dados.idInstrutor : curso.idInstrutor,
      idCategoria: dados.idCategoria ? +dados.idCategoria : curso.idCategoria,
      nivel: dados.nivel ?? curso.nivel,
    });
    store._salvar('cursos', cursos);
    return curso;
  },

  modulos(partes, dados) {
    const modulos = store._ler('modulos');
    const modulo = modulos.find(m => m.id === +partes[1]);
    if (!modulo) throw new Error('Modulo nao encontrado');
    if (dados.titulo) modulo.titulo = dados.titulo;
    if (dados.ordem) modulo.ordem = +dados.ordem;
    store._salvar('modulos', modulos);
    return modulo;
  },

  aulas(partes, dados) {
    const aulas = store._ler('aulas');
    const aula = aulas.find(a => a.id === +partes[1]);
    if (!aula) throw new Error('Aula nao encontrada');
    if (dados.titulo) aula.titulo = dados.titulo;
    if (dados.tipoConteudo) aula.tipoConteudo = dados.tipoConteudo;
    if (dados.urlConteudo !== undefined) aula.urlConteudo = dados.urlConteudo;
    if (dados.duracaoMinutos) aula.duracaoMinutos = +dados.duracaoMinutos;
    if (dados.ordem) aula.ordem = +dados.ordem;
    store._salvar('aulas', aulas);
    return aula;
  },

  trilhas(partes, dados) {
    const trilhas = store._ler('trilhas');
    const trilha = trilhas.find(t => t.id === +partes[1]);
    if (!trilha) throw new Error('Trilha nao encontrada');
    if (dados.titulo) trilha.titulo = dados.titulo;
    if (dados.descricao !== undefined) trilha.descricao = dados.descricao;
    if (dados.idCategoria) trilha.idCategoria = +dados.idCategoria;
    store._salvar('trilhas', trilhas);
    return trilha;
  },

  planos(partes, dados) {
    const planos = store._ler('planos');
    const plano = planos.find(p => p.id === +partes[1]);
    if (!plano) throw new Error('Plano nao encontrado');
    if (dados.nome) plano.nome = dados.nome;
    if (dados.descricao !== undefined) plano.descricao = dados.descricao;
    if (dados.preco) plano.preco = +dados.preco;
    if (dados.duracaoMeses) plano.duracaoMeses = +dados.duracaoMeses;
    store._salvar('planos', planos);
    return plano;
  },
};

// --- DELETE handlers ---

const deleteHandlers = {
  usuarios(partes) {
    const usuarios = store._ler('usuarios');
    const idx = usuarios.findIndex(u => u.id === +partes[1]);
    if (idx === -1) throw new Error('Usuario nao encontrado');
    usuarios.splice(idx, 1);
    store._salvar('usuarios', usuarios);
    return { mensagem: 'Usuario removido' };
  },

  categorias(partes) {
    const categorias = store._ler('categorias');
    const idx = categorias.findIndex(c => c.id === +partes[1]);
    if (idx === -1) throw new Error('Categoria nao encontrada');
    categorias.splice(idx, 1);
    store._salvar('categorias', categorias);
    return { mensagem: 'Categoria removida' };
  },

  cursos(partes) {
    const cursos = store._ler('cursos');
    const idx = cursos.findIndex(c => c.id === +partes[1]);
    if (idx === -1) throw new Error('Curso nao encontrado');
    cursos.splice(idx, 1);
    store._salvar('cursos', cursos);
    return { mensagem: 'Curso removido' };
  },

  modulos(partes) {
    const modulos = store._ler('modulos');
    const idx = modulos.findIndex(m => m.id === +partes[1]);
    if (idx === -1) throw new Error('Modulo nao encontrado');

    // Cascade: remover aulas do modulo
    const aulas = store._ler('aulas').filter(a => a.idModulo !== +partes[1]);
    store._salvar('aulas', aulas);

    modulos.splice(idx, 1);
    store._salvar('modulos', modulos);
    return { mensagem: 'Modulo removido' };
  },

  aulas(partes) {
    const aulas = store._ler('aulas');
    const aula = aulas.find(a => a.id === +partes[1]);
    if (!aula) throw new Error('Aula nao encontrada');

    const idModulo = aula.idModulo;
    const idx = aulas.indexOf(aula);
    aulas.splice(idx, 1);
    store._salvar('aulas', aulas);
    store._recalcularTotaisCurso(idModulo);
    return { mensagem: 'Aula removida' };
  },

  matriculas(partes) {
    const matriculas = store._ler('matriculas');
    const idx = matriculas.findIndex(m => m.id === +partes[1]);
    if (idx === -1) throw new Error('Matricula nao encontrada');
    matriculas.splice(idx, 1);
    store._salvar('matriculas', matriculas);
    return { mensagem: 'Matricula removida' };
  },

  progresso(partes) {
    // DELETE progresso/{idUsuario}/{idAula}
    const progressos = store._ler('progressoAulas');
    const idx = progressos.findIndex(
      p => p.idUsuario === +partes[1] && p.idAula === +partes[2]
    );
    if (idx !== -1) progressos.splice(idx, 1);
    store._salvar('progressoAulas', progressos);
    return { mensagem: 'Progresso removido' };
  },

  avaliacoes(partes) {
    const avaliacoes = store._ler('avaliacoes');
    const idx = avaliacoes.findIndex(a => a.id === +partes[1]);
    if (idx === -1) throw new Error('Avaliacao nao encontrada');
    avaliacoes.splice(idx, 1);
    store._salvar('avaliacoes', avaliacoes);
    return { mensagem: 'Avaliacao removida' };
  },

  trilhas(partes) {
    // DELETE trilhas/{id}/cursos/{idCurso}
    if (partes[2] === 'cursos') {
      const trilhasCursos = store._ler('trilhasCursos');
      const idx = trilhasCursos.findIndex(
        tc => tc.idTrilha === +partes[1] && tc.idCurso === +partes[3]
      );
      if (idx !== -1) trilhasCursos.splice(idx, 1);
      store._salvar('trilhasCursos', trilhasCursos);
      return { mensagem: 'Curso removido da trilha' };
    }

    // DELETE trilhas/{id}
    const trilhas = store._ler('trilhas');
    const idx = trilhas.findIndex(t => t.id === +partes[1]);
    if (idx === -1) throw new Error('Trilha nao encontrada');

    // Cascade: remover vinculos
    const trilhasCursos = store._ler('trilhasCursos').filter(tc => tc.idTrilha !== +partes[1]);
    store._salvar('trilhasCursos', trilhasCursos);

    trilhas.splice(idx, 1);
    store._salvar('trilhas', trilhas);
    return { mensagem: 'Trilha removida' };
  },

  certificados(partes) {
    const certificados = store._ler('certificados');
    const idx = certificados.findIndex(c => c.id === +partes[1]);
    if (idx === -1) throw new Error('Certificado nao encontrado');
    certificados.splice(idx, 1);
    store._salvar('certificados', certificados);
    return { mensagem: 'Certificado removido' };
  },

  planos(partes) {
    const planos = store._ler('planos');
    const idx = planos.findIndex(p => p.id === +partes[1]);
    if (idx === -1) throw new Error('Plano nao encontrado');
    planos.splice(idx, 1);
    store._salvar('planos', planos);
    return { mensagem: 'Plano removido' };
  },

  assinaturas(partes) {
    const assinaturas = store._ler('assinaturas');
    const idx = assinaturas.findIndex(a => a.id === +partes[1]);
    if (idx === -1) throw new Error('Assinatura nao encontrada');
    assinaturas.splice(idx, 1);
    store._salvar('assinaturas', assinaturas);
    return { mensagem: 'Assinatura removida' };
  },

  pagamentos(partes) {
    const pagamentos = store._ler('pagamentos');
    const idx = pagamentos.findIndex(p => p.id === +partes[1]);
    if (idx === -1) throw new Error('Pagamento nao encontrado');
    pagamentos.splice(idx, 1);
    store._salvar('pagamentos', pagamentos);
    return { mensagem: 'Pagamento removido' };
  },
};

// ===== API CLIENT (mesma interface) =====

class ApiClient {
  async get(recurso) {
    const { partes, params } = parseRoute(recurso);
    const handler = getHandlers[partes[0]];
    if (!handler) throw new Error('Recurso nao encontrado: ' + partes[0]);
    return handler(partes, params);
  }

  async post(recurso, dados) {
    const { partes } = parseRoute(recurso);
    const handler = postHandlers[partes[0]];
    if (!handler) throw new Error('Recurso nao encontrado: ' + partes[0]);
    return handler(partes, dados);
  }

  async put(recurso, dados) {
    const { partes } = parseRoute(recurso);
    const handler = putHandlers[partes[0]];
    if (!handler) throw new Error('Recurso nao encontrado: ' + partes[0]);
    return handler(partes, dados);
  }

  async delete(recurso) {
    const { partes } = parseRoute(recurso);
    const handler = deleteHandlers[partes[0]];
    if (!handler) throw new Error('Recurso nao encontrado: ' + partes[0]);
    return handler(partes);
  }
}

const api = new ApiClient();
