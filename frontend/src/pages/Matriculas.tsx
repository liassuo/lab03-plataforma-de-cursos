import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import { formatarData } from '../utils'
import type { Curso, Matricula, Usuario } from '../models'

export function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [idUsuario, setIdUsuario] = useState('')
  const [idCurso, setIdCurso] = useState('')
  const exibirToast = useToast()

  function carregar() {
    Promise.all([
      api.get<Matricula[]>('matriculas'),
      api.get<Usuario[]>('usuarios'),
      api.get<Curso[]>('cursos'),
    ])
      .then(([m, u, c]) => {
        setMatriculas(m)
        setUsuarios(u)
        setCursos(c)
      })
      .catch((erro) => exibirToast('Erro ao carregar matrículas: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('matriculas', { idUsuario, idCurso })
      setModalAberto(false)
      setIdUsuario('')
      setIdCurso('')
      carregar()
      exibirToast('Matrícula realizada com sucesso')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function remover(id: number) {
    if (!confirm('Deseja remover esta matrícula?')) return
    try {
      await api.delete(`matriculas/${id}`)
      carregar()
      exibirToast('Matrícula removida')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <div className="secao-header">
        <h2 className="titulo-secao mb-0">Matrículas</h2>
        <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
          <i className="bi bi-plus-lg me-1"></i>Nova Matrícula
        </button>
      </div>

      <div className="card">
        <div className="card-body tabela-container">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Aluno</th>
                <th>Curso</th>
                <th>Data Matrícula</th>
                <th>Conclusão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {matriculas.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted">Nenhuma matrícula registrada</td></tr>
              )}
              {matriculas.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.usuario?.nomeCompleto}</td>
                  <td>{m.curso?.titulo}</td>
                  <td>{formatarData(m.dataMatricula)}</td>
                  <td>{m.dataConclusao ? formatarData(m.dataConclusao) : <span className="badge bg-warning text-dark">Em andamento</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remover(m.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo="Nova Matrícula" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
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
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Matricular</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
