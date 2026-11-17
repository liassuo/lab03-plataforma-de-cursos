import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ToastProvider } from './components/Toasts'
import { estaLogado, podeAcessar } from './services/auth'
import { conectarSocket } from './services/socket'
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
import { Catalogo } from './pages/Catalogo'
import { CursoPagina } from './pages/CursoPagina'
import { MeusCursos } from './pages/MeusCursos'
import { Avisos } from './pages/Avisos'

export default function App() {
  const location = useLocation()
  const logado = estaLogado()

  // Se a página foi aberta (ou recarregada) já logado, reconecta o WebSocket.
  // Fica fora de um useEffect para conectar antes do Navbar começar a escutar
  // (conectarSocket não faz nada se já estiver conectado)
  if (logado) conectarSocket()

  // Sem login, qualquer rota redireciona para /login
  if (!logado && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // Já logado, não faz sentido ficar na tela de login
  if (logado && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  // Página que o perfil do usuário não pode acessar volta para o início
  if (logado && location.pathname !== '/login' && !podeAcessar(location.pathname)) {
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
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/curso/:id" element={<CursoPagina />} />
          <Route path="/meus-cursos" element={<MeusCursos />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {logado && (
        <footer>
          <div className="container text-center">
            <span>EduPlataforma - Plataforma de Cursos Online - LAB03</span>
          </div>
        </footer>
      )}
    </ToastProvider>
  )
}
