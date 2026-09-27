import type { ReactNode } from 'react'

interface Props {
  titulo: string
  aberto: boolean
  aoFechar: () => void
  children: ReactNode
}

// Modal controlado pelo React usando as classes do Bootstrap
export function Modal({ titulo, aberto, aoFechar, children }: Props) {
  if (!aberto) return null

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button type="button" className="btn-close" onClick={aoFechar}></button>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={aoFechar}></div>
    </>
  )
}
