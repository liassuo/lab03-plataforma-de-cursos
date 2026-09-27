import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import { corDoNivel, formatarData } from '../utils'
import type { Categoria, Curso, Usuario } from '../models'

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [idCategoria, setIdCategoria] = useState('')
  const [idInstrutor, setIdInstrutor] = useState('')
  const [nivel, setNivel] = useState('Iniciante')
  const exibirToast = useToast()

  function carregar() {
    Promise.all([
      api.get<Curso[]>('cursos'),
      api.get<Categoria[]>('categorias'),
      api.get<Usuario[]>('usuarios'),
    ])
      .then(([c, cat, u]) => {
        setCursos(c)
        setCategorias(cat)
        setUsuarios(u)
      })
      .catch((erro) => exibirToast('Erro ao carregar cursos: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('cursos', { titulo, descricao, idCategoria, idInstrutor, nivel })
      setModalAberto(false)
      setTitulo('')
      setDescricao('')
      setIdCategoria('')
      setIdInstrutor('')
      setNivel('Iniciante')
      carregar()
      exibirToast('Curso criado com sucesso')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function remover(id: number) {
    if (!confirm('Deseja remover este curso?')) return
    try {
      await api.delete(`cursos/${id}`)
      carregar()
      exibirToast('Curso removido')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  const cursosFiltrados = filtroCategoria
    ? cursos.filter((c) => c.idCategoria === +filtroCategoria)
    : cursos

  return (
    <section>
      <div className="secao-header">
        <h2 className="titulo-secao mb-0">Cursos</h2>
        <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
          <i className="bi bi-plus-lg me-1"></i>Novo Curso
        </button>
      </div>

      <div className="mb-3">
        <select
          className="form-select w-auto d-inline-block"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="row g-3">
        {cursosFiltrados.length === 0 && (
          <div className="col-12"><p className="text-muted">Nenhum curso encontrado</p></div>
        )}
        {cursosFiltrados.map((curso) => (
          <div className="col-md-6 col-lg-4" key={curso.id}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{curso.titulo}</h5>
                  <span className={`badge bg-${corDoNivel(curso.nivel)} badge-nivel`}>{curso.nivel}</span>
                </div>
                <p className="card-text text-muted">{curso.descricao || 'Sem descrição'}</p>
                <ul className="list-unstyled small text-muted mb-0">
                  <li><i className="bi bi-tag me-2"></i>{curso.categoria?.nome}</li>
                  <li><i className="bi bi-person me-2"></i>{curso.instrutor?.nomeCompleto}</li>
                  <li><i className="bi bi-collection-play me-2"></i>{curso.totalAulas} aula(s) &middot; {curso.totalHoras}h</li>
                  <li><i className="bi bi-calendar3 me-2"></i>Publicado em {formatarData(curso.dataPublicacao)}</li>
                </ul>
              </div>
              <div className="card-footer bg-transparent">
                <button className="btn btn-sm btn-outline-danger" onClick={() => remover(curso.id)}>
                  <i className="bi bi-trash me-1"></i>Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal titulo="Novo Curso" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <textarea className="form-control" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Categoria *</label>
              <select className="form-select" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} required>
                <option value="">-- Selecione --</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Instrutor *</label>
              <select className="form-select" value={idInstrutor} onChange={(e) => setIdInstrutor(e.target.value)} required>
                <option value="">-- Selecione --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Nível *</label>
              <select className="form-select" value={nivel} onChange={(e) => setNivel(e.target.value)}>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
