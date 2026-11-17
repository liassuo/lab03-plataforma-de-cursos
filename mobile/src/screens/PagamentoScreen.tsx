import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Curso, Matricula, RootStackParamList } from '../types';
import { api } from '../services/api';
import { Carregando } from '../components/Formulario';
import { cores } from '../styles/theme';
import { formatarPreco } from '../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Pagamento'>;

const metodos = [
  { valor: 'PIX', icone: 'qr-code-outline' },
  { valor: 'Cartão de Crédito', icone: 'card-outline' },
  { valor: 'Boleto', icone: 'barcode-outline' },
] as const;

// Checkout do curso. O pagamento é simulado (não existe gateway de verdade),
// mas fica registrado no banco junto com a matrícula
export default function PagamentoScreen({ route, navigation }: Props) {
  const { idCurso } = route.params;
  const [curso, setCurso] = useState<Curso | null>(null);
  const [metodo, setMetodo] = useState<string>('PIX');
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    api.get<Curso>(`cursos/${idCurso}`)
      .then(setCurso)
      .catch((erro) => Alert.alert('Erro', erro.message));
  }, [idCurso]);

  async function pagar() {
    setPagando(true);
    try {
      const matricula = await api.post<Matricula>('matriculas', { idCurso, metodoPagamento: metodo });
      const pagamento = matricula.pagamentos?.[0];
      Alert.alert(
        'Pagamento aprovado',
        pagamento
          ? `${formatarPreco(pagamento.valorPago)} via ${pagamento.metodoPagamento}\nTransação: ${pagamento.idTransacaoGateway}`
          : 'Matrícula realizada!',
        [{ text: 'Ver aulas', onPress: () => navigation.replace('Aulas', { idCurso }) }],
      );
    } catch (erro) {
      Alert.alert('Erro no pagamento', (erro as Error).message);
    } finally {
      setPagando(false);
    }
  }

  if (!curso) return <Carregando />;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.resumo}>
        <Text style={styles.rotulo}>Você está comprando</Text>
        <Text style={styles.curso}>{curso.titulo}</Text>
        <Text style={styles.preco}>{curso.preco > 0 ? formatarPreco(curso.preco) : 'Gratuito'}</Text>
      </View>

      {curso.preco > 0 && (
        <>
          <Text style={styles.secao}>Forma de pagamento</Text>
          {metodos.map((m) => {
            const selecionado = metodo === m.valor;
            return (
              <TouchableOpacity
                key={m.valor}
                style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                onPress={() => setMetodo(m.valor)}
              >
                <Ionicons name={m.icone} size={22} color={selecionado ? cores.primaria : cores.cinza} />
                <Text style={[styles.opcaoTexto, selecionado && styles.opcaoTextoSelecionado]}>{m.valor}</Text>
                <Ionicons
                  name={selecionado ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selecionado ? cores.primaria : cores.cinza}
                />
              </TouchableOpacity>
            );
          })}
        </>
      )}

      <TouchableOpacity style={[styles.botao, pagando && styles.botaoDesativado]} onPress={pagar} disabled={pagando}>
        {pagando ? (
          <ActivityIndicator color={cores.branco} />
        ) : (
          <Text style={styles.botaoTexto}>{curso.preco > 0 ? 'PAGAR E MATRICULAR' : 'MATRICULAR'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, gap: 12 },
  resumo: { padding: 20, borderRadius: 12, backgroundColor: cores.branco, alignItems: 'center', gap: 6 },
  rotulo: { color: cores.cinza },
  curso: { fontSize: 18, fontWeight: 'bold', color: cores.texto, textAlign: 'center' },
  preco: { fontSize: 28, fontWeight: 'bold', color: cores.primaria },
  secao: { fontSize: 16, fontWeight: 'bold', color: cores.texto, marginTop: 8 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  opcaoSelecionada: { borderColor: cores.primaria },
  opcaoTexto: { flex: 1, color: cores.texto },
  opcaoTextoSelecionado: { color: cores.primaria, fontWeight: 'bold' },
  botao: {
    height: 50,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: cores.sucesso,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
});
