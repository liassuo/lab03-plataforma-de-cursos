// Interfaces das entidades, espelhando o retorno da API

export interface Usuario {
  id: number
  nomeCompleto: string
  email: string
  dataCadastro?: string
}

export interface Categoria {
  id: number
  nome: string
  descricao?: string | null
}

export interface Curso {
  id: number
  titulo: string
  descricao?: string | null
  idInstrutor: number
  idCategoria: number
  nivel: string
  dataPublicacao: string
  totalAulas: number
  totalHoras: number
  categoria?: Categoria
  instrutor?: Usuario
  modulos?: Modulo[]
}

export interface Modulo {
  id: number
  idCurso: number
  titulo: string
  ordem: number
  aulas?: Aula[]
}

export interface Aula {
  id: number
  idModulo: number
  titulo: string
  tipoConteudo: string
  urlConteudo?: string | null
  duracaoMinutos: number
  ordem: number
}

export interface Matricula {
  id: number
  idUsuario: number
  idCurso: number
  dataMatricula: string
  dataConclusao?: string | null
  usuario?: Usuario
  curso?: Curso
}

export interface ProgressoAula {
  idUsuario: number
  idAula: number
  dataConclusao?: string | null
  status: string
}

export interface ResumoProgresso {
  totalAulas: number
  concluidas: number
  percentual: number
}

export interface Avaliacao {
  id: number
  idUsuario: number
  idCurso: number
  nota: number
  comentario?: string | null
  dataAvaliacao: string
  usuario?: Usuario
  curso?: Curso
}

export interface Trilha {
  id: number
  titulo: string
  descricao?: string | null
  idCategoria: number
  categoria?: Categoria
  cursos?: TrilhaCurso[]
}

export interface TrilhaCurso {
  idTrilha: number
  idCurso: number
  ordem: number
  curso?: Curso
}

export interface Certificado {
  id: number
  idUsuario: number
  idCurso: number
  idTrilha?: number | null
  codigoVerificacao: string
  dataEmissao: string
  usuario?: Usuario
  curso?: Curso
  trilha?: Trilha | null
  valido?: boolean
}

export interface Plano {
  id: number
  nome: string
  descricao?: string | null
  preco: number
  duracaoMeses: number
}

export interface Assinatura {
  id: number
  idUsuario: number
  idPlano: number
  dataInicio: string
  dataFim: string
  status: string
  usuario?: Usuario
  plano?: Plano
}

export interface Pagamento {
  id: number
  idAssinatura: number
  valorPago: number
  dataPagamento: string
  metodoPagamento: string
  idTransacaoGateway: string
  assinatura?: Assinatura
}
