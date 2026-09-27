import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type TipoToast = 'success' | 'danger' | 'warning'

interface Toast {
  id: number
  mensagem: string
  tipo: TipoToast
}

type ExibirToast = (mensagem: string, tipo?: TipoToast) => void

const ToastContext = createContext<ExibirToast>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

const icones: Record<TipoToast, string> = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-circle-fill',
  warning: 'bi-info-circle-fill',
}

// Provider que deixa qualquer página exibir notificações via useToast()
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function exibirToast(mensagem: string, tipo: TipoToast = 'success') {
    const id = Date.now() + Math.random()
    setToasts((atuais) => [...atuais, { id, mensagem, tipo }])
    setTimeout(() => {
      setToasts((atuais) => atuais.filter((t) => t.id !== id))
    }, 3500)
  }

  return (
    <ToastContext.Provider value={exibirToast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show align-items-center text-bg-${t.tipo} border-0 mb-2`} role="alert">
            <div className="d-flex">
              <div className="toast-body">
                <i className={`bi ${icones[t.tipo]} me-2`}></i>
                {t.mensagem}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
