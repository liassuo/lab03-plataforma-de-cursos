import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import type { Categoria, Curso, Trilha } from '../models'

export function Trilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])

  const [modalTrilha, setModalTrilha] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [idCategoria, setIdCategoria] = useState('')

  const [idTrilhaCurso, setIdTrilhaCurso] = useState<number | null>(null)
  const [idCursoNovo, setIdCursoNovo] = useState('')

  const exibirToast = useToast()

  function carregar() {
    Promise.all([
      api.get<Trilha[]>('trilhas'),
      api.get<Categoria[]>('categorias'),
      api.get<Curso[]>('cursos'),
    ])
      .then(([t, cat, c]) => {
        setTrilhas(t)
        setCategorias(cat)
        setCursos(c)
      })
      .catch((erro) => exibirToast('Erro ao carregar trilhas: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvarTrilha(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('trilhas', { titulo, descricao, idCategoria })
      setModalTrilha(false)
      setTitulo('')
      setDescricao('')
      setIdCategoria('')
      carregar()
      exibirToast('Trilha criada')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function adicionarCurso(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post(`trilhas/${idTrilhaCurso}/cursos`, { idCurso: idCursoNovo })
      setIdTrilhaCurso(null)
      setIdCursoNovo('')
      carregar()
      exibirToast('Curso adicionado à trilha')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function removerCurso(idTrilha: number, idCurso: number) {
    try {
      await api.delete(`trilhas/${idTrilha}/cursos/${idCurso}`)
      carregar()
      exibirToast('Curso removido da trilha')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function removerTrilha(id: number) {
    if (!confirm('Deseja remover esta trilha?')) return
    try {
      await api.delete(`trilhas/${id}`)
      carregar()
      exibirToast('Trilha removida')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <div className="secao-header">
        <h2 className="titulo-secao mb-0">Trilhas de Conhecimento</h2>
        <button className="btn btn-primary" onClick={() => setModalTrilha(true)}>
          <i className="bi bi-plus-lg me-1"></i>Nova Trilha
        </button>
      </div>

      <div className="row g-3">
        {trilhas.length === 0 && (
          <div className="col-12"><p className="text-muted">Nenhuma trilha cadastrada</p></div>
        )}
        {trilhas.map((trilha) => (
          <div className="col-md-6" key={trilha.id}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title">{trilha.titulo}</h5>
                  <span className="badge bg-primary">{trilha.categoria?.nome}</span>
                </div>
                <p className="card-text text-muted">{trilha.descricao || 'Sem descrição'}</p>

                <h6 className="small fw-bold text-muted text-uppercase">Cursos da trilha</h6>
                {(trilha.cursos || []).length === 0 && (
                  <p className="text-muted small mb-2">Nenhum curso na trilha ainda.</p>
                )}
                {(trilha.cursos || []).map((tc) => (
                  <div key={tc.idCurso} className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
                    <span className="small">{tc.ordem}. {tc.curso?.titulo}</span>
                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => removerCurso(trilha.id, tc.idCurso)}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="card-footer bg-transparent d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => setIdTrilhaCurso(trilha.id)}>
                  <i className="bi bi-plus-lg me-1"></i>Adicionar Curso
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => removerTrilha(trilha.id)}>
                  <i className="bi bi-trash me-1"></i>Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal titulo="Nova Trilha" aberto={modalTrilha} aoFechar={() => setModalTrilha(false)}>
        <form onSubmit={salvarTrilha}>
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
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalTrilha(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal titulo="Adicionar Curso à Trilha" aberto={idTrilhaCurso !== null} aoFechar={() => setIdTrilhaCurso(null)}>
        <form onSubmit={adicionarCurso}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Curso *</label>
              <select className="form-select" value={idCursoNovo} onChange={(e) => setIdCursoNovo(e.target.value)} required>
                <option value="">-- Selecione --</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIdTrilhaCurso(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
