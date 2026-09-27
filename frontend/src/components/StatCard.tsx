interface Props {
  icone: string
  cor: string
  valor: number
  rotulo: string
}

// Card de estatística do painel inicial
export function StatCard({ icone, cor, valor, rotulo }: Props) {
  return (
    <div className="col-md-3 col-6">
      <div className="card stat-card p-3">
        <div className="d-flex align-items-center gap-3">
          <div className={`stat-icon bg-${cor} bg-opacity-10 text-${cor}`}>
            <i className={`bi ${icone}`}></i>
          </div>
          <div>
            <h4>{valor}</h4>
            <small className="text-muted">{rotulo}</small>
          </div>
        </div>
      </div>
    </div>
  )
}
