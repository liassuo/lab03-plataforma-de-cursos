import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useToast } from '../components/Toasts'
import type { Curso, ProgressoAula, ResumoProgresso, Usuario } from '../models'

export function Progresso() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [idUsuario, setIdUsuario] = useState('')
  const [idCurso, setIdCurso] = useState('')

  const [curso, setCurso] = useState<Curso | null>(null)
  const [resumo, setResumo] = useState<ResumoProgresso | null>(null)
  const [progresso, setProgresso] = useState<ProgressoAula[]>([])

  const exibirToast = useToast()

  useEffect(() => {
    Promise.all([api.get<Usuario[]>('usuarios'), api.get<Curso[]>('cursos')])
      .then(([u, c]) => {
        setUsuarios(u)
        setCursos(c)
      })
      .catch((erro) => exibirToast('Erro ao carregar dados: ' + erro.message, 'danger'))
  }, [])

  async function consultar() {
    if (!idUsuario || !idCurso) {
      exibirToast('Selecione o aluno e o curso', 'warning')
      return
    }
    try {
      const [cursoDetalhe, resumoDados, progressoDados] = await Promise.all([
        api.get<Curso>(`cursos/${idCurso}`),
        api.get<ResumoProgresso>(`progresso/resumo/${idUsuario}/${idCurso}`),
        api.get<ProgressoAula[]>(`progresso?idUsuario=${idUsuario}&idCurso=${idCurso}`),
      ])
      setCurso(cursoDetalhe)
      setResumo(resumoDados)
      setProgresso(progressoDados)
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  function aulaConcluida(idAula: number) {
    return progresso.some((p) => p.idAula === idAula && p.status === 'Concluido')
  }

  async function alternarAula(idAula: number) {
    try {
      if (aulaConcluida(idAula)) {
        await api.delete(`progresso/${idUsuario}/${idAula}`)
      } else {
        await api.post('progresso', { idUsuario, idAula, status: 'Concluido' })
      }
      consultar()
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <h2 className="titulo-secao">Progresso do Aluno</h2>

      <div className="card mb-4">
        <div className="card-header bg-primary bg-opacity-10 text-primary">
          <i className="bi bi-search me-2"></i>Consultar Progresso
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-5">
              <label className="form-label small text-muted">Aluno</label>
              <select className="form-select" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
                <option value="">-- Selecione --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label small text-muted">Curso</label>
              <select className="form-select" value={idCurso} onChange={(e) => setIdCurso(e.target.value)}>
                <option value="">-- Selecione --</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={consultar}>Ver</button>
            </div>
          </div>
        </div>
      </div>

      {resumo && curso && (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <h5>Progresso Geral</h5>
              <div className="progress progresso-barra mb-2">
                <div className="progress-bar bg-success" style={{ width: `${resumo.percentual}%` }}></div>
              </div>
              <small className="text-muted">
                {resumo.concluidas} de {resumo.totalAulas} aula(s) concluída(s) — {resumo.percentual}%
              </small>
            </div>
          </div>

          {(curso.modulos || []).map((modulo) => (
            <div className="card mb-3" key={modulo.id}>
              <div className="card-header bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-folder me-2"></i>{modulo.ordem}. {modulo.titulo}
              </div>
              <div className="card-body">
                {(modulo.aulas || []).length === 0 && <p className="text-muted mb-0">Sem aulas neste módulo.</p>}
                {(modulo.aulas || []).map((aula) => (
                  <div key={aula.id} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`aula-${aula.id}`}
                      checked={aulaConcluida(aula.id)}
                      onChange={() => alternarAula(aula.id)}
                    />
                    <label className="form-check-label" htmlFor={`aula-${aula.id}`}>
                      {aula.ordem}. {aula.titulo}
                      <small className="text-muted ms-2">{aula.duracaoMinutos} min</small>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  )
}
