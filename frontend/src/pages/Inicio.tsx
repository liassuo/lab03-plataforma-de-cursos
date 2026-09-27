import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { StatCard } from '../components/StatCard'
import { corDoNivel } from '../utils'
import type { Certificado, Curso, Matricula, Usuario } from '../models'

export function Inicio() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])

  useEffect(() => {
    Promise.all([
      api.get<Usuario[]>('usuarios'),
      api.get<Curso[]>('cursos'),
      api.get<Matricula[]>('matriculas'),
      api.get<Certificado[]>('certificados'),
    ])
      .then(([u, c, m, cert]) => {
        setUsuarios(u)
        setCursos(c)
        setMatriculas(m)
        setCertificados(cert)
      })
      .catch((erro) => console.error('Erro ao carregar painel:', erro))
  }, [])

  const cursosRecentes = cursos.slice(-5).reverse()
  const usuariosRecentes = usuarios.slice(-5).reverse()

  return (
    <section>
      <h2 className="titulo-secao">Painel Geral</h2>
      <p className="text-muted mb-4">Visão geral dos dados cadastrados na plataforma.</p>

      <div className="row g-3">
        <StatCard icone="bi-people-fill" cor="primary" valor={usuarios.length} rotulo="Usuários" />
        <StatCard icone="bi-book-fill" cor="success" valor={cursos.length} rotulo="Cursos" />
        <StatCard icone="bi-person-check-fill" cor="warning" valor={matriculas.length} rotulo="Matrículas" />
        <StatCard icone="bi-award-fill" cor="info" valor={certificados.length} rotulo="Certificados" />
      </div>

      <div className="row mt-4 g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-book me-2"></i>Cursos Recentes
            </div>
            <div className="card-body">
              {cursosRecentes.length === 0 && <p className="text-muted">Nenhum curso cadastrado</p>}
              {cursosRecentes.map((c) => (
                <div key={c.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span>{c.titulo}</span>
                  <span className={`badge bg-${corDoNivel(c.nivel)}`}>{c.nivel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success bg-opacity-10 text-success">
              <i className="bi bi-people me-2"></i>Últimos Usuários
            </div>
            <div className="card-body">
              {usuariosRecentes.length === 0 && <p className="text-muted">Nenhum usuário cadastrado</p>}
              {usuariosRecentes.map((u) => (
                <div key={u.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span>{u.nomeCompleto}</span>
                  <small className="text-muted">{u.email}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
