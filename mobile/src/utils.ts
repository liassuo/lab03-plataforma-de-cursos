import { Alert, Platform, ToastAndroid } from 'react-native';

export function formatarData(data?: string | null) {
  return data ? new Date(data).toLocaleDateString('pt-BR') : '-';
}

export function formatarPreco(valor: number) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

// Executa uma chamada à API e mostra a mensagem de erro, se der errado.
// Evita repetir o mesmo try/catch em todas as telas de cadastro.
export async function tentar(acao: () => Promise<void>) {
  try {
    await acao();
  } catch (erro) {
    Alert.alert('Erro', (erro as Error).message);
  }
}

// Mensagem curta de sucesso. No Android usa o "toast" nativo (some sozinho)
export function avisar(mensagem: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(mensagem, ToastAndroid.SHORT);
  } else {
    Alert.alert(mensagem);
  }
}

// Confere os campos obrigatórios antes de chamar a API.
// Recebe pares [nome do campo, valor] e devolve true se algum estiver vazio.
export function faltaPreencher(campos: [string, unknown][]) {
  const vazios = campos
    .filter(([, valor]) => valor === null || valor === undefined || String(valor).trim() === '')
    .map(([nome]) => nome);

  if (vazios.length > 0) {
    Alert.alert('Campos obrigatórios', `Preencha: ${vazios.join(', ')}`);
    return true;
  }
  return false;
}
