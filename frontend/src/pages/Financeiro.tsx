import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import { formatarData, formatarPreco } from '../utils'
import type { Assinatura, Pagamento, Plano, Usuario } from '../models'

export function Financeiro() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  const [modalPlano, setModalPlano] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [duracao, setDuracao] = useState('')

  const [idUsuario, setIdUsuario] = useState('')
  const [idPlano, setIdPlano] = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState('Cartão de Crédito')

  const exibirToast = useToast()

  function carregar() {
    Promise.all([
      api.get<Plano[]>('planos'),
      api.get<Assinatura[]>('assinaturas'),
      api.get<Pagamento[]>('pagamentos'),
      api.get<Usuario[]>('usuarios'),
    ])
      .then(([pl, a, pg, u]) => {
        setPlanos(pl)
        setAssinaturas(a)
        setPagamentos(pg)
        setUsuarios(u)
      })
      .catch((erro) => exibirToast('Erro ao carregar dados financeiros: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function salvarPlano(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('planos', { nome, descricao, preco, duracaoMeses: duracao })
      setModalPlano(false)
      setNome('')
      setDescricao('')
      setPreco('')
      setDuracao('')
      carregar()
      exibirToast('Plano criado')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function removerPlano(id: number) {
    if (!confirm('Deseja remover este plano?')) return
    try {
      await api.delete(`planos/${id}`)
      carregar()
      exibirToast('Plano removido')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  // Fluxo de checkout: cria a assinatura e registra o pagamento em seguida
  async function assinar() {
    if (!idUsuario || !idPlano) {
      exibirToast('Selecione o usuário e o plano', 'warning')
      return
    }
    try {
      const assinatura = await api.post<Assinatura>('assinaturas', { idUsuario, idPlano })
      await api.post('pagamentos', { idAssinatura: assinatura.id, metodoPagamento })
      setIdUsuario('')
      setIdPlano('')
      carregar()
      exibirToast('Assinatura realizada e pagamento registrado!')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <h2 className="titulo-secao">Financeiro</h2>

      <div className="secao-header">
        <h5 className="subtitulo-secao mb-0"><i className="bi bi-tag"></i>Planos Disponíveis</h5>
        <button className="btn btn-sm btn-outline-primary" onClick={() => setModalPlano(true)}>
          <i className="bi bi-plus-lg me-1"></i>Novo Plano
        </button>
      </div>

      <div className="row g-3 mb-4">
        {planos.length === 0 && (
          <div className="col-12"><p className="text-muted">Nenhum plano cadastrado</p></div>
        )}
        {planos.map((plano) => (
          <div className="col-md-4" key={plano.id}>
            <div className="card plano-card h-100 text-center">
              <div className="card-body">
                <h5 className="card-title">{plano.nome}</h5>
                <p className="text-muted small">{plano.descricao || 'Sem descrição'}</p>
                <div className="plano-preco">
                  {formatarPreco(plano.preco)} <small>/{plano.duracaoMeses} {plano.duracaoMeses === 1 ? 'mês' : 'meses'}</small>
                </div>
              </div>
              <div className="card-footer bg-transparent">
                <button className="btn btn-sm btn-outline-danger" onClick={() => removerPlano(plano.id)}>
                  <i className="bi bi-trash me-1"></i>Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="separador" />

      <div className="card mb-4">
        <div className="card-header bg-primary bg-opacity-10 text-primary">
          <i className="bi bi-cart-check me-2"></i>Simular Assinatura
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <select className="form-select" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
                <option value="">-- Usuário --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={idPlano} onChange={(e) => setIdPlano(e.target.value)}>
                <option value="">-- Plano --</option>
                {planos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} ({formatarPreco(p.preco)})</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto">Boleto</option>
                <option value="PIX">PIX</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={assinar}>Assinar</button>
            </div>
          </div>
        </div>
      </div>

      <hr className="separador" />
      <h5 className="subtitulo-secao"><i className="bi bi-clipboard-check"></i>Assinaturas</h5>
      <div className="card mb-4">
        <div className="card-body tabela-container">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Plano</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted">Nenhuma assinatura registrada</td></tr>
              )}
              {assinaturas.map((a) => (
                <tr key={a.id}>
                  <td>{a.usuario?.nomeCompleto}</td>
                  <td>{a.plano?.nome}</td>
                  <td>{formatarData(a.dataInicio)}</td>
                  <td>{formatarData(a.dataFim)}</td>
                  <td><span className="badge bg-success">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="separador" />
      <h5 className="subtitulo-secao"><i className="bi bi-credit-card"></i>Pagamentos</h5>
      <div className="card">
        <div className="card-body tabela-container">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Assinatura</th>
                <th>Valor</th>
                <th>Método</th>
                <th>ID Transação</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted">Nenhum pagamento registrado</td></tr>
              )}
              {pagamentos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>#{p.idAssinatura}</td>
                  <td>{formatarPreco(p.valorPago)}</td>
                  <td>{p.metodoPagamento}</td>
                  <td><code>{p.idTransacaoGateway}</code></td>
                  <td>{formatarData(p.dataPagamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo="Novo Plano" aberto={modalPlano} aoFechar={() => setModalPlano(false)}>
        <form onSubmit={salvarPlano}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nome *</label>
              <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <textarea className="form-control" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Preço (R$) *</label>
                <input type="number" className="form-control" min={0} step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Duração (meses) *</label>
                <input type="number" className="form-control" min={1} value={duracao} onChange={(e) => setDuracao(e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalPlano(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
