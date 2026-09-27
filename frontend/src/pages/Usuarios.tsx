import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import { formatarData } from '../utils'
import type { Usuario } from '../models'

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const exibirToast = useToast()

  function carregar() {
    api.get<Usuario[]>('usuarios')
      .then(setUsuarios)
      .catch((erro) => exibirToast('Erro ao carregar usuários: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('usuarios', { nomeCompleto: nome, email, senha })
      setModalAberto(false)
      setNome('')
      setEmail('')
      setSenha('')
      carregar()
      exibirToast('Usuário cadastrado com sucesso')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function remover(id: number) {
    if (!confirm('Deseja remover este usuário?')) return
    try {
      await api.delete(`usuarios/${id}`)
      carregar()
      exibirToast('Usuário removido')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <div className="secao-header">
        <h2 className="titulo-secao mb-0">Usuários</h2>
        <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
          <i className="bi bi-plus-lg me-1"></i>Novo Usuário
        </button>
      </div>

      <div className="card">
        <div className="card-body tabela-container">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome Completo</th>
                <th>Email</th>
                <th>Data Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted">Nenhum usuário cadastrado</td></tr>
              )}
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nomeCompleto}</td>
                  <td>{u.email}</td>
                  <td>{formatarData(u.dataCadastro)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remover(u.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo="Novo Usuário" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nome Completo *</label>
              <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha *</label>
              <input type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={4} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
