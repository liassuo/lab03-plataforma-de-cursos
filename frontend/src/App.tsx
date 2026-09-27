import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ToastProvider } from './components/Toasts'
import { estaLogado } from './services/auth'
import { Login } from './pages/Login'
import { Inicio } from './pages/Inicio'
import { Usuarios } from './pages/Usuarios'
import { Categorias } from './pages/Categorias'
import { Cursos } from './pages/Cursos'
import { Conteudo } from './pages/Conteudo'
import { Trilhas } from './pages/Trilhas'
import { Matriculas } from './pages/Matriculas'
import { Progresso } from './pages/Progresso'
import { Avaliacoes } from './pages/Avaliacoes'
import { Certificados } from './pages/Certificados'
import { Financeiro } from './pages/Financeiro'

export default function App() {
  const location = useLocation()
  const logado = estaLogado()

  // Sem login, qualquer rota redireciona para /login
  if (!logado && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // Já logado, não faz sentido ficar na tela de login
  if (logado && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  return (
    <ToastProvider>
      {logado && <Navbar />}
      <main className="container-fluid conteudo-principal py-4 px-3 px-md-5">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Inicio />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/conteudo" element={<Conteudo />} />
          <Route path="/trilhas" element={<Trilhas />} />
          <Route path="/matriculas" element={<Matriculas />} />
          <Route path="/progresso" element={<Progresso />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
          <Route path="/certificados" element={<Certificados />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {logado && (
        <footer>
          <div className="container text-center">
            <span>EduPlataforma &mdash; Plataforma de Cursos Online &mdash; LAB03</span>
          </div>
        </footer>
      )}
    </ToastProvider>
  )
}
