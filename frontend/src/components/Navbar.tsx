import { NavLink, useNavigate } from 'react-router-dom'
import { fazerLogout, obterUsuarioLogado } from '../services/auth'

export function Navbar() {
  const navigate = useNavigate()
  const usuario = obterUsuarioLogado()

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
              <NavLink className="nav-link" to="/usuarios">Usuários</NavLink>
            </li>
            <li className="nav-item dropdown">
              <button className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Acadêmico
              </button>
              <ul className="dropdown-menu">
                <li><NavLink className="dropdown-item" to="/categorias">Categorias</NavLink></li>
                <li><NavLink className="dropdown-item" to="/cursos">Cursos</NavLink></li>
                <li><NavLink className="dropdown-item" to="/conteudo">Módulos e Aulas</NavLink></li>
                <li><hr className="dropdown-divider" /></li>
                <li><NavLink className="dropdown-item" to="/trilhas">Trilhas</NavLink></li>
              </ul>
            </li>
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
          </ul>
          <div className="d-flex align-items-center">
            <span className="navbar-text text-white me-3">
              <i className="bi bi-person-circle me-1"></i>{usuario?.nomeCompleto}
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
