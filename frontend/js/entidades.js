class Usuario {
  constructor(id, nomeCompleto, email, dataCadastro) {
    this.id = id;
    this.nomeCompleto = nomeCompleto;
    this.email = email;
    this.dataCadastro = dataCadastro;
  }
}

class Categoria {
  constructor(id, nome, descricao) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
  }
}

class Curso {
  constructor(id, titulo, descricao, idInstrutor, idCategoria, nivel, dataPublicacao, totalAulas, totalHoras) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.idInstrutor = idInstrutor;
    this.idCategoria = idCategoria;
    this.nivel = nivel;
    this.dataPublicacao = dataPublicacao;
    this.totalAulas = totalAulas;
    this.totalHoras = totalHoras;
  }
}

class Modulo {
  constructor(id, idCurso, titulo, ordem) {
    this.id = id;
    this.idCurso = idCurso;
    this.titulo = titulo;
    this.ordem = ordem;
  }
}

class Aula {
  constructor(id, idModulo, titulo, tipoConteudo, urlConteudo, duracaoMinutos, ordem) {
    this.id = id;
    this.idModulo = idModulo;
    this.titulo = titulo;
    this.tipoConteudo = tipoConteudo;
    this.urlConteudo = urlConteudo;
    this.duracaoMinutos = duracaoMinutos;
    this.ordem = ordem;
  }
}

class Matricula {
  constructor(id, idUsuario, idCurso, dataMatricula, dataConclusao) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idCurso = idCurso;
    this.dataMatricula = dataMatricula;
    this.dataConclusao = dataConclusao;
  }
}

class ProgressoAula {
  constructor(idUsuario, idAula, dataConclusao, status) {
    this.idUsuario = idUsuario;
    this.idAula = idAula;
    this.dataConclusao = dataConclusao;
    this.status = status;
  }
}

class Avaliacao {
  constructor(id, idUsuario, idCurso, nota, comentario, dataAvaliacao) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idCurso = idCurso;
    this.nota = nota;
    this.comentario = comentario;
    this.dataAvaliacao = dataAvaliacao;
  }
}

class Trilha {
  constructor(id, titulo, descricao, idCategoria) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.idCategoria = idCategoria;
  }
}

class Certificado {
  constructor(id, idUsuario, idCurso, idTrilha, codigoVerificacao, dataEmissao) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idCurso = idCurso;
    this.idTrilha = idTrilha;
    this.codigoVerificacao = codigoVerificacao;
    this.dataEmissao = dataEmissao;
  }
}

class Plano {
  constructor(id, nome, descricao, preco, duracaoMeses) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.duracaoMeses = duracaoMeses;
  }
}

class Assinatura {
  constructor(id, idUsuario, idPlano, dataInicio, dataFim, status) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idPlano = idPlano;
    this.dataInicio = dataInicio;
    this.dataFim = dataFim;
    this.status = status;
  }
}

class Pagamento {
  constructor(id, idAssinatura, valorPago, dataPagamento, metodoPagamento, idTransacaoGateway) {
    this.id = id;
    this.idAssinatura = idAssinatura;
    this.valorPago = valorPago;
    this.dataPagamento = dataPagamento;
    this.metodoPagamento = metodoPagamento;
    this.idTransacaoGateway = idTransacaoGateway;
  }
}
