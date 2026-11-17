import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useToast } from '../components/Toasts'
import { corDoNivel } from '../utils'
import type { Curso } from '../models'

// Catálogo de cursos: o mesmo que a aba "Cursos" do app
export function Catalogo() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const exibirToast = useToast()

  useEffect(() => {
    api.get<Curso[]>('cursos')
      .then(setCursos)
      .catch((erro) => exibirToast('Erro ao carregar cursos: ' + erro.message, 'danger'))
  }, [])

  return (
    <section>
      <h2 className="titulo-secao">Cursos disponíveis</h2>

      <div className="row g-3">
        {cursos.length === 0 && <p className="text-muted">Nenhum curso cadastrado</p>}
        {cursos.map((curso) => (
          <div className="col-md-6 col-lg-4" key={curso.id}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{curso.titulo}</h5>
                  <span className={`badge bg-${corDoNivel(curso.nivel)}`}>{curso.nivel}</span>
                </div>
                <p className="card-text text-muted">{curso.descricao || 'Sem descrição'}</p>
                <ul className="list-unstyled small text-muted mb-0">
                  <li><i className="bi bi-tag me-2"></i>{curso.categoria?.nome}</li>
                  <li><i className="bi bi-person me-2"></i>{curso.instrutor?.nomeCompleto}</li>
                  <li><i className="bi bi-collection-play me-2"></i>{curso.totalAulas} aula(s) &middot; {curso.totalHoras}h</li>
                </ul>
              </div>
              <div className="card-footer bg-transparent">
                <Link className="btn btn-sm btn-primary" to={`/curso/${curso.id}`}>
                  <i className="bi bi-eye me-1"></i>Ver curso
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
