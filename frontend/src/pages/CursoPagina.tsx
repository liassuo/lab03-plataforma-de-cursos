import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import { obterUsuarioLogado } from '../services/auth'
import { useToast } from '../components/Toasts'
import { formatarData, formatarPreco } from '../utils'
import type { Certificado, Curso, Matricula, MeuProgresso } from '../models'

// Página de um curso: detalhes, compra e, para quem comprou, as aulas e o certificado.
// Junta numa página só o que no app são as telas "Detalhe do curso" e "Aulas".
export function CursoPagina() {
  const idCurso = Number(useParams().id)
  const aluno = obterUsuarioLogado()?.tipo === 'ALUNO'
  const exibirToast = useToast()

  const [curso, setCurso] = useState<Curso | null>(null)
  const [matriculado, setMatriculado] = useState(false)
  const [progresso, setProgresso] = useState<MeuProgresso | null>(null)
  const [certificado, setCertificado] = useState<Certificado | null>(null)
  const [metodoPagamento, setMetodoPagamento] = useState('PIX')

  async function carregar() {
    try {
      setCurso(await api.get<Curso>(`cursos/${idCurso}`))
      if (!aluno) return

      const matriculas = await api.get<Matricula[]>('matriculas/minhas')
      const comprou = matriculas.some((m) => m.idCurso === idCurso)
      setMatriculado(comprou)
      if (comprou) {
        setProgresso(await api.get<MeuProgresso>(`progresso/meu/${idCurso}`))
        const certificados = await api.get<Certificado[]>('certificados/meus')
        setCertificado(certificados.find((c) => c.idCurso === idCurso) ?? null)
      }
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  useEffect(() => {
    carregar()
  }, [idCurso])

  // Pagamento simulado: o backend grava a matrícula e o pagamento juntos
  async function comprar() {
    try {
      await api.post('matriculas', { idCurso, metodoPagamento })
      exibirToast('Pagamento aprovado! Você foi matriculado no curso.')
      carregar()
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function concluir(idAula: number) {
    try {
      await api.post('progresso', { idAula })
      carregar()
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  async function emitirCertificado() {
    try {
      setCertificado(await api.post<Certificado>('certificados', { idCurso }))
      exibirToast('Parabéns! Seu certificado foi emitido.')
    } catch (erro) {
      exibirToast((erro as Error).message, 'danger')
    }
  }

  if (!curso) return <p className="text-muted">Carregando...</p>

  return (
    <section>
      <h2 className="titulo-secao">{curso.titulo}</h2>
      <p className="text-muted">{curso.descricao || 'Sem descrição'}</p>
      <p className="small text-muted">
        {curso.categoria?.nome} &middot; {curso.nivel} &middot; Instrutor: {curso.instrutor?.nomeCompleto} &middot;{' '}
        {curso.totalAulas} aula(s), {curso.totalHoras}h &middot; Atualizado em {formatarData(curso.dataAtualizacao)}
      </p>

      {aluno && !matriculado && (
        <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
          {curso.preco > 0 && (
            <select className="form-select w-auto" value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
              <option value="PIX">PIX</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Boleto">Boleto</option>
            </select>
          )}
          <button className="btn btn-primary" onClick={comprar}>
            <i className="bi bi-cart me-1"></i>
            {curso.preco > 0 ? `Comprar por ${formatarPreco(curso.preco)}` : 'Matricular grátis'}
          </button>
        </div>
      )}

      {aluno && matriculado && progresso && (
        <div className="card mb-4">
          <div className="card-body">
            <p className="mb-2">
              {progresso.concluidas} de {progresso.totalAulas} aulas concluídas ({progresso.percentual}%)
            </p>
            <div className="progress">
              <div className="progress-bar bg-success" style={{ width: `${progresso.percentual}%` }}></div>
            </div>

            {/* Certificado: liberado quando o curso chega a 100% */}
            {progresso.percentual === 100 && (
              <div className="mt-3">
                {certificado ? (
                  <div className="alert alert-success mb-0">
                    <i className="bi bi-award-fill me-2"></i>
                    Certificado emitido em {formatarData(certificado.dataEmissao)} &middot; código{' '}
                    <strong>{certificado.codigoVerificacao}</strong>
                  </div>
                ) : (
                  <button className="btn btn-success" onClick={emitirCertificado}>
                    <i className="bi bi-award me-1"></i>Emitir certificado
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <h4>Conteúdo do curso</h4>
      {curso.modulos?.length === 0 && <p className="text-muted">Nenhum módulo cadastrado ainda.</p>}

      {curso.modulos?.map((modulo) => (
        <div className="card mb-3" key={modulo.id}>
          <div className="card-header fw-bold">{modulo.ordem}. {modulo.titulo}</div>
          <ul className="list-group list-group-flush">
            {modulo.aulas?.map((aula) => {
              const concluida = progresso?.aulasConcluidas.includes(aula.id)
              return (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={aula.id}>
                  <span>
                    {matriculado && (
                      <i className={`bi me-2 ${concluida ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                    )}
                    {aula.titulo}
                    <small className="text-muted ms-2">{aula.tipoConteudo} &middot; {aula.duracaoMinutos} min</small>
                  </span>
                  {/* Só quem comprou assiste e conclui as aulas */}
                  {matriculado && (
                    <span className="d-flex gap-2">
                      {aula.urlConteudo && (
                        <a className="btn btn-sm btn-outline-primary" href={aula.urlConteudo} target="_blank" rel="noreferrer">
                          Assistir
                        </a>
                      )}
                      {!concluida && (
                        <button className="btn btn-sm btn-outline-success" onClick={() => concluir(aula.id)}>
                          Concluir
                        </button>
                      )}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
