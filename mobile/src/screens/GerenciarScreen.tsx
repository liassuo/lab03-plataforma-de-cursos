import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabProps, TipoUsuario } from '../types';
import { obterUsuario } from '../services/api';
import { cores } from '../styles/theme';

// Mesmas funções do menu da web; cada item diz quais perfis podem usá-lo
const itens: {
  tela: keyof RootStackParamList;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
  perfis: TipoUsuario[];
}[] = [
  { tela: 'GerCursos', titulo: 'Cursos', descricao: 'Cadastrar, editar e remover cursos', icone: 'book-outline', perfis: ['AUTOR', 'ADMIN'] },
  { tela: 'GerConteudo', titulo: 'Módulos e Aulas', descricao: 'Conteúdo de cada curso', icone: 'list-outline', perfis: ['AUTOR', 'ADMIN'] },
  { tela: 'GerUsuarios', titulo: 'Usuários', descricao: 'Cadastro e perfis dos usuários', icone: 'people-outline', perfis: ['ADMIN'] },
  { tela: 'GerCategorias', titulo: 'Categorias', descricao: 'Categorias dos cursos', icone: 'pricetags-outline', perfis: ['ADMIN'] },
  { tela: 'GerTrilhas', titulo: 'Trilhas', descricao: 'Sequências de cursos', icone: 'git-network-outline', perfis: ['ADMIN'] },
  { tela: 'GerMatriculas', titulo: 'Matrículas', descricao: 'Alunos matriculados nos cursos', icone: 'person-add-outline', perfis: ['ADMIN'] },
  { tela: 'GerProgresso', titulo: 'Progresso', descricao: 'Aulas concluídas por aluno', icone: 'stats-chart-outline', perfis: ['ADMIN'] },
  { tela: 'GerAvaliacoes', titulo: 'Avaliações', descricao: 'Notas dos cursos', icone: 'star-outline', perfis: ['ADMIN'] },
  { tela: 'GerCertificados', titulo: 'Certificados', descricao: 'Emitir e verificar certificados', icone: 'ribbon-outline', perfis: ['ADMIN'] },
  { tela: 'GerFinanceiro', titulo: 'Financeiro', descricao: 'Planos, assinaturas e pagamentos', icone: 'cash-outline', perfis: ['ADMIN'] },
];

export default function GerenciarScreen({ navigation }: TabProps<'Gerenciar'>) {
  const tipo = obterUsuario().tipo;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {itens
        .filter((item) => item.perfis.includes(tipo))
        .map((item) => (
          <TouchableOpacity key={item.tela} style={styles.item} onPress={() => navigation.navigate(item.tela as any)}>
            <View style={styles.icone}>
              <Ionicons name={item.icone} size={22} color={cores.primaria} />
            </View>
            <View style={styles.textos}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemDescricao}>{item.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={cores.cinza} />
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: cores.branco,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textos: { flex: 1 },
  itemTitulo: { fontWeight: 'bold', color: cores.texto },
  itemDescricao: { fontSize: 13, color: cores.cinza },
});
