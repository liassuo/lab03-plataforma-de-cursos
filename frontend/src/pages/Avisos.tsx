import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { aoReceberNotificacao } from '../services/socket'
import { useToast } from '../components/Toasts'
import type { Notificacao } from '../models'

export function Avisos() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const exibirToast = useToast()

  useEffect(() => {
    api.get<Notificacao[]>('notificacoes/minhas')
      .then((lista) => {
        setNotificacoes(lista)
        // Abriu a página: todas passam a contar como lidas no backend
        return api.post('notificacoes/lidas')
      })
      .catch((erro) => exibirToast('Erro ao carregar avisos: ' + erro.message, 'danger'))

    // Enquanto a página está aberta, a notificação nova entra no topo da lista
    return aoReceberNotificacao((nova) => {
      setNotificacoes((lista) => [nova, ...lista])
      api.post('notificacoes/lidas').catch(() => {})
    })
  }, [])

  return (
    <section>
      <h2 className="titulo-secao">Avisos</h2>

      {notificacoes.length === 0 && <p className="text-muted">Nenhuma notificação</p>}

      <div className="list-group">
        {notificacoes.map((n) => (
          // Não lidas ficam destacadas
          <div className={`list-group-item ${!n.lida ? 'border-start border-primary border-4' : ''}`} key={n.id}>
            <div>{n.mensagem}</div>
            <small className="text-muted">{new Date(n.dataCriacao).toLocaleString('pt-BR')}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
