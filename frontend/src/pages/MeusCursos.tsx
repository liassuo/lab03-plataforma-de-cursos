import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useToast } from '../components/Toasts'
import { formatarData } from '../utils'
import type { Matricula } from '../models'

export function MeusCursos() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const exibirToast = useToast()

  useEffect(() => {
    api.get<Matricula[]>('matriculas/minhas')
      .then(setMatriculas)
      .catch((erro) => exibirToast('Erro ao carregar seus cursos: ' + erro.message, 'danger'))
  }, [])

  return (
    <section>
      <h2 className="titulo-secao">Meus cursos</h2>

      {matriculas.length === 0 && (
        <p className="text-muted">
          Você ainda não está matriculado em nenhum curso. <Link to="/catalogo">Ver cursos disponíveis</Link>
        </p>
      )}

      <div className="row g-3">
        {matriculas.map((matricula) => (
          <div className="col-md-6 col-lg-4" key={matricula.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{matricula.curso?.titulo}</h5>
                <p className="small text-muted mb-1">Matriculado em {formatarData(matricula.dataMatricula)}</p>
                {matricula.dataConclusao && (
                  <span className="badge bg-success">Concluído em {formatarData(matricula.dataConclusao)}</span>
                )}
              </div>
              <div className="card-footer bg-transparent">
                <Link className="btn btn-sm btn-primary" to={`/curso/${matricula.idCurso}`}>
                  <i className="bi bi-play-circle me-1"></i>Acessar aulas
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
