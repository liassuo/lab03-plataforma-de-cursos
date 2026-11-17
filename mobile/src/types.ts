import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type TipoUsuario = 'ALUNO' | 'AUTOR' | 'ADMIN';

export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  tipo: TipoUsuario;
  dataCadastro?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Aula {
  id: number;
  titulo: string;
  tipoConteudo: string;
  urlConteudo: string | null;
  duracaoMinutos: number;
  ordem: number;
}

export interface Modulo {
  id: number;
  titulo: string;
  ordem: number;
  aulas: Aula[];
}

export interface Curso {
  id: number;
  titulo: string;
  descricao: string | null;
  nivel: string;
  idInstrutor: number;
  idCategoria: number;
  dataAtualizacao: string;
  totalAulas: number;
  totalHoras: number;
  preco: number;
  categoria?: { nome: string };
  instrutor?: { nomeCompleto: string };
  modulos?: Modulo[];
}

export interface Matricula {
  id: number;
  idUsuario: number;
  idCurso: number;
  dataMatricula: string;
  dataConclusao: string | null;
  curso: Curso;
  usuario?: Usuario;
  pagamentos?: Pagamento[];
}

export interface Progresso {
  totalAulas: number;
  concluidas: number;
  percentual: number;
  aulasConcluidas: number[];
}

export interface Certificado {
  id: number;
  idCurso: number;
  codigoVerificacao: string;
  dataEmissao: string;
  usuario?: Usuario;
  curso?: Curso;
}

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  dataCriacao: string;
}

export interface Trilha {
  id: number;
  titulo: string;
  descricao: string | null;
  categoria?: Categoria;
  cursos?: { idCurso: number; ordem: number; curso?: Curso }[];
}

export interface Avaliacao {
  id: number;
  nota: number;
  comentario: string | null;
  usuario?: Usuario;
  curso?: Curso;
}

export interface Plano {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoMeses: number;
}

export interface Assinatura {
  id: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  usuario?: Usuario;
  plano?: Plano;
}

export interface Pagamento {
  id: number;
  valorPago: number;
  dataPagamento: string;
  metodoPagamento: string;
  idTransacaoGateway: string;
}

// Telas da pilha principal e os parâmetros que cada uma recebe
export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Principal: undefined;
  CursoDetalhe: { idCurso: number };
  Pagamento: { idCurso: number };
  Aulas: { idCurso: number };
  // Telas de gestão (Admin e Autor), abertas pelo menu "Gerenciar"
  GerUsuarios: undefined;
  GerCategorias: undefined;
  GerCursos: undefined;
  GerConteudo: undefined;
  GerTrilhas: undefined;
  GerMatriculas: undefined;
  GerProgresso: undefined;
  GerAvaliacoes: undefined;
  GerCertificados: undefined;
  GerFinanceiro: undefined;
};

// Abas da tela principal
export type TabParamList = {
  Inicio: undefined;
  Cursos: undefined;
  Trilhas: undefined;
  MeusCursos: undefined;
  Gerenciar: undefined;
  Notificacoes: undefined;
};

// Props de uma tela de aba, que também pode navegar para as telas da pilha
export type TabProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
