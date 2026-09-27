// Funções auxiliares usadas em várias páginas

export function formatarData(dataStr?: string | null): string {
  if (!dataStr) return '-'
  // A API devolve datas no formato ISO (2025-01-15T00:00:00.000Z)
  const partes = String(dataStr).split('T')[0].split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return String(dataStr)
}

export function corDoNivel(nivel: string): string {
  if (nivel === 'Iniciante') return 'success'
  if (nivel === 'Intermediário') return 'warning'
  return 'danger'
}

export function formatarPreco(valor: number): string {
  return 'R$ ' + valor.toFixed(2).replace('.', ',')
}
