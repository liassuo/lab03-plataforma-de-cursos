import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toasts'
import type { Curso } from '../models'

export function Conteudo() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [idCursoSelecionado, setIdCursoSelecionado] = useState('')
  const [curso, setCurso] = useState<Curso | null>(null)

  const [modalModulo, setModalModulo] = useState(false)
  const [tituloModulo, setTituloModulo] = useState('')

  const [idModuloAula, setIdModuloAula] = useState<number | null>(null)
  const [tituloAula, setTituloAula] = useState('')
  const [tipoAula, setTipoAula] = useState('Video')
  const [duracaoAula, setDuracaoAula] = useState('')
  const [urlAula, setUrlAula] = useState('')

  const exibirToast = useToast()

  useEffect(() => {
    api.get<Curso[]>('cursos')
      .then(setCursos)
      .catch((erro) => exibirToast('Erro ao carregar cursos: ' + erro.message, 'danger'))
  }, [])

  function carregarCurso(id: string) {
    setIdCursoSelecionado(id)
    if (!id) {
      setCurso(null)
      return
    }
    api.get<Curso>(`cursos/${id}`)
      .then(setCurso)
      .catch((erro) => exibirToast('Erro ao carregar curso: ' + erro.message, 'danger'))
  }

  function recarregar() {
    if (idCursoSelecionado) carregarCurso(idCursoSelecionado)
  }

  async function salvarModulo(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('modulos', { idCurso: idCursoSelecionado, titulo: tituloModulo })
      setModalModulo(false)
      setTituloModulo('')
      recarregar()
      exibirToast('Módulo criado')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function salvarAula(evento: FormEvent) {
    evento.preventDefault()
    try {
      await api.post('aulas', {
        idModulo: idModuloAula,
        titulo: tituloAula,
        tipoConteudo: tipoAula,
        duracaoMinutos: +duracaoAula,
        urlConteudo: urlAula,
      })
      setIdModuloAula(null)
      setTituloAula('')
      setTipoAula('Video')
      setDuracaoAula('')
      setUrlAula('')
      recarregar()
      exibirToast('Aula criada')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function removerModulo(id: number) {
    if (!confirm('Remover este módulo e todas as suas aulas?')) return
    try {
      await api.delete(`modulos/${id}`)
      recarregar()
      exibirToast('Módulo removido')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function removerAula(id: number) {
    if (!confirm('Remover esta aula?')) return
    try {
      await api.delete(`aulas/${id}`)
      recarregar()
      exibirToast('Aula removida')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  return (
    <section>
      <h2 className="titulo-secao">Módulos e Aulas</h2>

      <div className="mb-3">
        <label className="form-label fw-bold">Selecione um curso:</label>
        <select className="form-select" value={idCursoSelecionado} onChange={(e) => carregarCurso(e.target.value)}>
          <option value="">-- Escolha um curso --</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>

      {curso && (
        <>
          <div className="secao-header">
            <h5 className="mb-0">{curso.titulo} <small className="text-muted">({curso.totalAulas} aula(s), {curso.totalHoras}h)</small></h5>
            <button className="btn btn-sm btn-outline-primary" onClick={() => setModalModulo(true)}>
              <i className="bi bi-plus-lg me-1"></i>Novo Módulo
            </button>
          </div>

          {(curso.modulos || []).length === 0 && (
            <p className="text-muted">Este curso ainda não tem módulos.</p>
          )}

          {(curso.modulos || []).map((modulo) => (
            <div className="card mb-3" key={modulo.id}>
              <div className="card-header bg-primary bg-opacity-10 text-primary d-flex justify-content-between align-items-center">
                <span><i className="bi bi-folder me-2"></i>{modulo.ordem}. {modulo.titulo}</span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setIdModuloAula(modulo.id)}>
                    <i className="bi bi-plus-lg me-1"></i>Aula
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removerModulo(modulo.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div className="card-body">
                {(modulo.aulas || []).length === 0 && <p className="text-muted mb-0">Nenhuma aula neste módulo.</p>}
                {(modulo.aulas || []).map((aula) => (
                  <div key={aula.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <span>
                      <i className={`bi me-2 ${aula.tipoConteudo === 'Video' ? 'bi-play-circle' : aula.tipoConteudo === 'Quiz' ? 'bi-question-circle' : 'bi-file-text'}`}></i>
                      {aula.ordem}. {aula.titulo}
                      <small className="text-muted ms-2">{aula.duracaoMinutos} min &middot; {aula.tipoConteudo}</small>
                    </span>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removerAula(aula.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <Modal titulo="Novo Módulo" aberto={modalModulo} aoFechar={() => setModalModulo(false)}>
        <form onSubmit={salvarModulo}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input type="text" className="form-control" value={tituloModulo} onChange={(e) => setTituloModulo(e.target.value)} required />
            </div>
            <small className="text-muted">A ordem é definida automaticamente.</small>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalModulo(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal titulo="Nova Aula" aberto={idModuloAula !== null} aoFechar={() => setIdModuloAula(null)}>
        <form onSubmit={salvarAula}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input type="text" className="form-control" value={tituloAula} onChange={(e) => setTituloAula(e.target.value)} required />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Tipo de Conteúdo</label>
                <select className="form-select" value={tipoAula} onChange={(e) => setTipoAula(e.target.value)}>
                  <option value="Video">Vídeo</option>
                  <option value="Texto">Texto</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Duração (min) *</label>
                <input type="number" className="form-control" min={1} value={duracaoAula} onChange={(e) => setDuracaoAula(e.target.value)} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">URL do Conteúdo</label>
              <input type="text" className="form-control" placeholder="Ex: https://..." value={urlAula} onChange={(e) => setUrlAula(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIdModuloAula(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
