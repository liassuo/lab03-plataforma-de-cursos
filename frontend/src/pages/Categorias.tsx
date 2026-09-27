import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import type { Categoria, Curso } from '../models'

export function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const exibirToast = useToast()

  function carregar() {
    Promise.all([api.get<Categoria[]>('categorias'), api.get<Curso[]>('cursos')])
      .then(([cats, curs]) => {
        setCategorias(cats)
        setCursos(curs)
      })
      .catch((erro) => exibirToast('Erro ao carregar categorias: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('categorias', { nome, descricao })
      setModalAberto(false)
      setNome('')
      setDescricao('')
      carregar()
      exibirToast('Categoria criada com sucesso')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function remover(id: number) {
    if (!confirm('Deseja remover esta categoria?')) return
    try {
      await api.delete(`categorias/${id}`)
      carregar()
      exibirToast('Categoria removida')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <div className="secao-header">
        <h2 className="titulo-secao mb-0">Categorias</h2>
        <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
          <i className="bi bi-plus-lg me-1"></i>Nova Categoria
        </button>
      </div>

      <div className="row g-3">
        {categorias.length === 0 && (
          <div className="col-12"><p className="text-muted">Nenhuma categoria cadastrada</p></div>
        )}
        {categorias.map((cat) => {
          const qtdCursos = cursos.filter((c) => c.idCategoria === cat.id).length
          return (
            <div className="col-md-4" key={cat.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{cat.nome}</h5>
                  <p className="card-text text-muted">{cat.descricao || 'Sem descrição'}</p>
                  <span className="badge bg-primary">{qtdCursos} curso(s)</span>
                </div>
                <div className="card-footer bg-transparent">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remover(cat.id)}>
                    <i className="bi bi-trash me-1"></i>Remover
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal titulo="Nova Categoria" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nome *</label>
              <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <textarea className="form-control" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
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
