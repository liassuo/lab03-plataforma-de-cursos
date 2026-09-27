import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import { formatarData } from '../utils'
import type { Certificado, Curso, Usuario } from '../models'

export function Certificados() {
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [idUsuario, setIdUsuario] = useState('')
  const [idCurso, setIdCurso] = useState('')
  const [gerado, setGerado] = useState<Certificado | null>(null)

  const [modalVerificar, setModalVerificar] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [verificado, setVerificado] = useState<Certificado | null>(null)
  const [erroVerificacao, setErroVerificacao] = useState('')

  const exibirToast = useToast()

  function carregar() {
    Promise.all([
      api.get<Certificado[]>('certificados'),
      api.get<Usuario[]>('usuarios'),
      api.get<Curso[]>('cursos'),
    ])
      .then(([cert, u, c]) => {
        setCertificados(cert)
        setUsuarios(u)
        setCursos(c)
      })
      .catch((erro) => exibirToast('Erro ao carregar certificados: ' + erro.message, 'danger'))
  }

  useEffect(carregar, [])

  async function gerar() {
    if (!idUsuario || !idCurso) {
      exibirToast('Selecione o aluno e o curso', 'warning')
      return
    }
    try {
      const certificado = await api.post<Certificado>('certificados', { idUsuario, idCurso })
      setGerado(certificado)
      carregar()
      exibirToast('Certificado emitido!')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function verificar() {
    setVerificado(null)
    setErroVerificacao('')
    try {
      const certificado = await api.get<Certificado>(`certificados/verificar/${codigo.trim()}`)
      setVerificado(certificado)
    } catch (erro) {
      setErroVerificacao((erro as Error).message)
    }
  }

  return (
    <section>
      <h2 className="titulo-secao">Certificados</h2>

      <div className="card mb-4">
        <div className="card-header bg-primary bg-opacity-10 text-primary">
          <i className="bi bi-award me-2"></i>Emitir Certificado
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label small text-muted">Aluno</label>
              <select className="form-select" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
                <option value="">-- Selecione --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Curso</label>
              <select className="form-select" value={idCurso} onChange={(e) => setIdCurso(e.target.value)}>
                <option value="">-- Selecione --</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={gerar}>Gerar</button>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={() => setModalVerificar(true)}>Verificar</button>
            </div>
          </div>
        </div>
      </div>

      {gerado && (
        <div className="certificado-container mb-4">
          <p className="text-muted mb-1">CERTIFICADO DE CONCLUSÃO</p>
          <h3>{gerado.usuario?.nomeCompleto}</h3>
          <p className="mb-1">concluiu com êxito o curso</p>
          <h5 className="mb-3">{gerado.curso?.titulo}</h5>
          <p className="certificado-codigo mb-1">{gerado.codigoVerificacao}</p>
          <small className="text-muted">Emitido em {formatarData(gerado.dataEmissao)}</small>
        </div>
      )}

      <hr className="separador" />
      <h5 className="subtitulo-secao"><i className="bi bi-list-check"></i>Certificados Emitidos</h5>

      <div className="card">
        <div className="card-body tabela-container">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Curso</th>
                <th>Código</th>
                <th>Data Emissão</th>
              </tr>
            </thead>
            <tbody>
              {certificados.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted">Nenhum certificado emitido</td></tr>
              )}
              {certificados.map((c) => (
                <tr key={c.id}>
                  <td>{c.usuario?.nomeCompleto}</td>
                  <td>{c.curso?.titulo}</td>
                  <td><code>{c.codigoVerificacao}</code></td>
                  <td>{formatarData(c.dataEmissao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo="Verificar Certificado" aberto={modalVerificar} aoFechar={() => setModalVerificar(false)}>
        <div className="modal-body">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Ex: CERT-ABCD1234"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button className="btn btn-primary" onClick={verificar}>Verificar</button>
          </div>
          {erroVerificacao && <div className="alert alert-danger mb-0">{erroVerificacao}</div>}
          {verificado && (
            <div className="alert alert-success mb-0">
              <i className="bi bi-patch-check-fill me-2"></i>
              Certificado válido! <strong>{verificado.usuario?.nomeCompleto}</strong> concluiu o curso{' '}
              <strong>{verificado.curso?.titulo}</strong> em {formatarData(verificado.dataEmissao)}.
            </div>
          )}
        </div>
      </Modal>
    </section>
  )
}
