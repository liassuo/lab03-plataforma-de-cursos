class Store {
  private contadores: Record<string, number> = {};

  categorias: any[] = [];
  cursos: any[] = [];
  modulos: any[] = [];
  aulas: any[] = [];
  usuarios: any[] = [];
  matriculas: any[] = [];
  progressoAulas: any[] = [];
  avaliacoes: any[] = [];
  trilhas: any[] = [];
  trilhasCursos: any[] = [];
  certificados: any[] = [];
  planos: any[] = [];
  assinaturas: any[] = [];
  pagamentos: any[] = [];

  proximoId(entidade: string): number {
    this.contadores[entidade] = (this.contadores[entidade] || 0) + 1;
    return this.contadores[entidade];
  }

  constructor() {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais() {
    // Categorias
    this.categorias.push(
      { id: this.proximoId('categorias'), nome: 'Desenvolvimento Web', descricao: 'Cursos de programação web front e backend' },
      { id: this.proximoId('categorias'), nome: 'Data Science', descricao: 'Análise de dados, machine learning e estatística' },
      { id: this.proximoId('categorias'), nome: 'Design', descricao: 'UI/UX, design gráfico e prototipação' },
    );

    // Usuarios
    this.usuarios.push(
      {
        id: this.proximoId('usuarios'),
        nomeCompleto: 'Carlos Silva',
        email: 'carlos@email.com',
        senhaHash: 'abc123',
        dataCadastro: '2025-01-15',
      },
      {
        id: this.proximoId('usuarios'),
        nomeCompleto: 'Ana Souza',
        email: 'ana@email.com',
        senhaHash: 'def456',
        dataCadastro: '2025-02-10',
      },
      {
        id: this.proximoId('usuarios'),
        nomeCompleto: 'Prof. Marcos Lima',
        email: 'marcos@email.com',
        senhaHash: 'ghi789',
        dataCadastro: '2024-11-01',
      },
    );

    // Cursos
    this.cursos.push(
      {
        id: this.proximoId('cursos'),
        titulo: 'JavaScript do Zero ao Avançado',
        descricao: 'Aprenda JS desde o básico até conceitos avançados',
        idInstrutor: 3,
        idCategoria: 1,
        nivel: 'Iniciante',
        dataPublicacao: '2025-03-01',
        totalAulas: 0,
        totalHoras: 0,
      },
      {
        id: this.proximoId('cursos'),
        titulo: 'Python para Data Science',
        descricao: 'Fundamentos de Python aplicados a ciência de dados',
        idInstrutor: 3,
        idCategoria: 2,
        nivel: 'Intermediário',
        dataPublicacao: '2025-04-01',
        totalAulas: 0,
        totalHoras: 0,
      },
    );

    // Planos
    this.planos.push(
      { id: this.proximoId('planos'), nome: 'Básico', descricao: 'Acesso a 3 cursos por mês', preco: 29.90, duracaoMeses: 1 },
      { id: this.proximoId('planos'), nome: 'Pro', descricao: 'Acesso ilimitado a todos os cursos', preco: 59.90, duracaoMeses: 6 },
      { id: this.proximoId('planos'), nome: 'Premium', descricao: 'Acesso ilimitado + certificados + suporte', preco: 99.90, duracaoMeses: 12 },
    );
  }
}

export const store = new Store();
