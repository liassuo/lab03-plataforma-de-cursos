import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import { formatarData } from '../utils'
import type { Avaliacao, Curso, Usuario } from '../models'

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="estrelas">
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`bi ${n <= nota ? 'bi-star-fill' : 'bi-star'}`}></i>
      ))}
    </span>
  )
}

export function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [idUsuario, setIdUsuario] = useState('')
  const [idCurso, setIdCurso] = useState('')
  const [nota, setNota] = useState('5')
  const [comentario, setComentario] = useState('')
  const exibirToast = useToast()

  function carregar() {
    Promise.all([
      api.get<Avaliacao[]>('avaliacoes'),
      api.get<Usuario[]>('usuarios'),
      api.get<Curso[]>('cursos'),
    ])
      .then(([a, u, c]) => {
        setAvaliacoes(a)
        setUsuarios(u)
        setCursos(c)
      })
      .catch((erro) => exibirToast('Erro ao carregar avaliações: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('avaliacoes', { idUsuario, idCurso, nota, comentario })
      setModalAberto(false)
      setIdUsuario('')
      setIdCurso('')
      setNota('5')
      setComentario('')
      carregar()
      exibirToast('Avaliação registrada')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function remover(id: number) {
    if (!confirm('Deseja remover esta avaliação?')) return
    try {
      await api.delete(`avaliacoes/${id}`)
      carregar()
      exibirToast('Avaliação removida')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <div className="secao-header">
        <h2 className="titulo-secao mb-0">Avaliações</h2>
        <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
          <i className="bi bi-plus-lg me-1"></i>Nova Avaliação
        </button>
      </div>

      <div className="card">
        <div className="card-body tabela-container">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Curso</th>
                <th>Nota</th>
                <th>Comentário</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted">Nenhuma avaliação registrada</td></tr>
              )}
              {avaliacoes.map((a) => (
                <tr key={a.id}>
                  <td>{a.usuario?.nomeCompleto}</td>
                  <td>{a.curso?.titulo}</td>
                  <td><Estrelas nota={a.nota} /></td>
                  <td>{a.comentario || '-'}</td>
                  <td>{formatarData(a.dataAvaliacao)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remover(a.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo="Nova Avaliação" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Aluno *</label>
              <select className="form-select" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} required>
                <option value="">-- Selecione --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Curso *</label>
              <select className="form-select" value={idCurso} onChange={(e) => setIdCurso(e.target.value)} required>
                <option value="">-- Selecione --</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Nota * (1 a 5)</label>
              <select className="form-select" value={nota} onChange={(e) => setNota(e.target.value)}>
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Bom</option>
                <option value="3">3 - Regular</option>
                <option value="2">2 - Ruim</option>
                <option value="1">1 - Péssimo</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Comentário</label>
              <textarea className="form-control" rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Avaliar</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
