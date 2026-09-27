import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fazerLogin } from '../services/auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    try {
      await fazerLogin(email, senha)
      navigate('/')
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-lg-4 col-md-6 col-sm-10">
        <div className="card">
          <div className="card-body p-4">
            <h4 className="text-center mb-1">
              <i className="bi bi-mortarboard-fill me-2 text-primary"></i>EduPlataforma
            </h4>
            <p className="text-center text-muted mb-4">Entre para acessar a plataforma</p>

            {erro && <div className="alert alert-danger">{erro}</div>}

            <form onSubmit={aoEnviar}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-box-arrow-in-right me-1"></i>Entrar
              </button>
            </form>

            <small className="text-muted d-block mt-3 text-center">
              Usuário de teste: teste@email.com / 123456
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
