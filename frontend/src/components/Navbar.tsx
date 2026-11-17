import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { fazerLogout, obterUsuarioLogado, podeAcessar } from '../services/auth'
import { api } from '../services/api'
import { aoReceberNotificacao } from '../services/socket'
import { useToast } from './Toasts'
import type { Notificacao } from '../models'

export function Navbar() {
  const navigate = useNavigate()
  const usuario = obterUsuarioLogado()
  const admin = usuario?.tipo === 'ADMIN'
  const aluno = usuario?.tipo === 'ALUNO'
  const location = useLocation()
  const exibirToast = useToast()

  // Quantidade de avisos não lidos, mostrada ao lado do link "Avisos"
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    api.get<Notificacao[]>('notificacoes/minhas')
      .then((lista) => setNaoLidas(lista.filter((n) => !n.lida).length))
      .catch(() => {})
  }, [])

  // Tempo real: chegou aviso pelo WebSocket fora da página de avisos
  useEffect(() => {
    return aoReceberNotificacao((nova) => {
      if (window.location.hash === '#/avisos') return
      setNaoLidas((total) => total + 1)
      exibirToast(nova.mensagem, 'warning')
    })
  }, [])

  // Abriu a página de avisos: zera o contador
  useEffect(() => {
    if (location.pathname === '/avisos') setNaoLidas(0)
  }, [location.pathname])

  function sair() {
    fazerLogout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          <i className="bi bi-mortarboard-fill me-2"></i>EduPlataforma
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navPrincipal">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navPrincipal">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Início</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/catalogo">Catálogo</NavLink>
            </li>
            {aluno && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/meus-cursos">Meus Cursos</NavLink>
              </li>
            )}
            {admin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/usuarios">Usuários</NavLink>
              </li>
            )}
            {podeAcessar('/cursos') && (
              <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  Acadêmico
                </button>
                <ul className="dropdown-menu">
                  {admin && <li><NavLink className="dropdown-item" to="/categorias">Categorias</NavLink></li>}
                  <li><NavLink className="dropdown-item" to="/cursos">Cursos</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/conteudo">Módulos e Aulas</NavLink></li>
                  {admin && <li><hr className="dropdown-divider" /></li>}
                  {admin && <li><NavLink className="dropdown-item" to="/trilhas">Trilhas</NavLink></li>}
                </ul>
              </li>
            )}
            {admin && (
              <>
                <li className="nav-item dropdown">
                  <button className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Interação
                  </button>
                  <ul className="dropdown-menu">
                    <li><NavLink className="dropdown-item" to="/matriculas">Matrículas</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/progresso">Progresso</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/avaliacoes">Avaliações</NavLink></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><NavLink className="dropdown-item" to="/certificados">Certificados</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/financeiro">Financeiro</NavLink>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center">
            <NavLink className="nav-link text-white me-3" to="/avisos">
              <i className="bi bi-bell me-1"></i>Avisos
              {naoLidas > 0 && <span className="badge bg-danger ms-1">{naoLidas}</span>}
            </NavLink>
            <span className="navbar-text text-white me-3">
              <i className="bi bi-person-circle me-1"></i>{usuario?.nomeCompleto}
              <span className="badge bg-light text-dark ms-2">{usuario?.tipo}</span>
            </span>
            <button className="btn btn-sm btn-outline-light" onClick={sair}>
              <i className="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
