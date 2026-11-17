// Componentes simples reaproveitados nas telas do app
import { ReactNode, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../styles/theme';

// Cartão com o formulário de cadastro. Começa fechado para a lista aparecer primeiro;
// tocar no cabeçalho abre e fecha. A tela pode controlar "aberto" de fora (ex: ao editar).
export function CartaoFormulario({ titulo, children, aberto, aoAlternar }: {
  titulo: string;
  children: ReactNode;
  aberto?: boolean;
  aoAlternar?: () => void;
}) {
  const [abertoInterno, setAbertoInterno] = useState(false);
  const estaAberto = aberto ?? abertoInterno;
  const alternar = aoAlternar ?? (() => setAbertoInterno(!abertoInterno));

  return (
    <View style={styles.cartaoForm}>
      <TouchableOpacity style={styles.cartaoFormTopo} onPress={alternar}>
        <Ionicons name={estaAberto ? 'remove-circle-outline' : 'add-circle-outline'} size={22} color={cores.primaria} />
        <Text style={styles.cartaoFormTitulo}>{titulo}</Text>
      </TouchableOpacity>
      {estaAberto && <View style={styles.cartaoFormCorpo}>{children}</View>}
    </View>
  );
}

// Indicador enquanto os dados ainda estão chegando da API
export function Carregando() {
  return <ActivityIndicator style={styles.carregando} size="large" color={cores.primaria} />;
}

// Mensagem para lista vazia, com um ícone
export function Vazio({ texto, icone = 'file-tray-outline' }: { texto: string; icone?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.vazio}>
      <Ionicons name={icone} size={40} color={cores.cinza} />
      <Text style={styles.vazioTexto}>{texto}</Text>
    </View>
  );
}

// Campo de texto com rótulo em cima
export function Campo({ rotulo, ...props }: { rotulo: string } & TextInputProps) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput style={styles.input} placeholderTextColor={cores.cinza} {...props} />
    </View>
  );
}

// Seletor em "chips": uma linha com rolagem horizontal e uma opção marcada.
// Substitui o <select> da web, que não existe no React Native.
interface Opcao {
  valor: string | number;
  texto: string;
}

export function Seletor({ rotulo, opcoes, valor, aoMudar }: {
  rotulo: string;
  opcoes: Opcao[];
  valor: string | number | null;
  aoMudar: (valor: any) => void;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {opcoes.map((opcao) => {
          const marcado = opcao.valor === valor;
          return (
            <TouchableOpacity
              key={opcao.valor}
              style={[styles.chip, marcado && styles.chipMarcado]}
              onPress={() => aoMudar(opcao.valor)}
            >
              <Text style={[styles.chipTexto, marcado && styles.chipTextoMarcado]}>{opcao.texto}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Botão com três cores: principal, perigo (remover) e contorno
export function Botao({ texto, aoTocar, tipo = 'principal' }: {
  texto: string;
  aoTocar: () => void;
  tipo?: 'principal' | 'perigo' | 'contorno';
}) {
  return (
    <TouchableOpacity style={[styles.botao, styles[tipo]]} onPress={aoTocar}>
      <Text style={[styles.botaoTexto, tipo === 'contorno' && styles.botaoTextoContorno]}>{texto}</Text>
    </TouchableOpacity>
  );
}

// Pergunta antes de remover; só chama "acao" se o usuário confirmar
export function confirmarRemocao(descricao: string, acao: () => void) {
  Alert.alert('Remover', `Deseja remover ${descricao}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Remover', style: 'destructive', onPress: acao },
  ]);
}

// Estilos que as telas de gestão também usam (tela, cartão, títulos)
export const estilosGestao = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 12 },
  cartao: { padding: 14, borderRadius: 12, backgroundColor: cores.branco, gap: 6 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: cores.texto },
  texto: { color: cores.texto },
  detalhe: { color: cores.cinza, fontSize: 13 },
  secao: { fontSize: 18, fontWeight: 'bold', color: cores.texto, marginTop: 8 },
  vazio: { textAlign: 'center', color: cores.cinza, marginTop: 20 },
  // Linha com o texto à esquerda e os botões à direita
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  botoesLinha: { flexDirection: 'row', gap: 8 },
});

const styles = StyleSheet.create({
  cartaoForm: { borderRadius: 12, backgroundColor: cores.branco },
  cartaoFormTopo: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  cartaoFormTitulo: { fontSize: 16, fontWeight: 'bold', color: cores.primaria },
  cartaoFormCorpo: { paddingHorizontal: 14, paddingBottom: 14, gap: 12 },
  carregando: { marginTop: 40 },
  vazio: { alignItems: 'center', gap: 8, marginTop: 40, paddingHorizontal: 20 },
  vazioTexto: { color: cores.cinza, textAlign: 'center' },
  campo: { gap: 6 },
  rotulo: { fontWeight: 'bold', color: cores.texto },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
    color: cores.texto,
  },
  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  chipMarcado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { color: cores.texto },
  chipTextoMarcado: { color: cores.branco, fontWeight: 'bold' },
  botao: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principal: { backgroundColor: cores.primaria },
  perigo: { backgroundColor: cores.erro },
  contorno: { borderWidth: 1, borderColor: cores.primaria, backgroundColor: cores.branco },
  botaoTexto: { color: cores.branco, fontWeight: 'bold' },
  botaoTextoContorno: { color: cores.primaria },
});
