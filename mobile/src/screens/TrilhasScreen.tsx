import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TabProps, Trilha } from '../types';
import { api } from '../services/api';
import { Carregando, Vazio } from '../components/Formulario';
import { cores } from '../styles/theme';
import { formatarPreco, tentar } from '../utils';

// Trilha = sequência de cursos de uma categoria, na ordem recomendada
export default function TrilhasScreen({ navigation }: TabProps<'Trilhas'>) {
  const [trilhas, setTrilhas] = useState<Trilha[] | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    await tentar(async () => setTrilhas(await api.get<Trilha[]>('trilhas')));
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, []),
  );

  async function puxarParaAtualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  if (!trilhas) return <Carregando />;

  return (
    <FlatList
      style={styles.tela}
      data={trilhas}
      keyExtractor={(trilha) => String(trilha.id)}
      contentContainerStyle={styles.lista}
      refreshing={atualizando}
      onRefresh={puxarParaAtualizar}
      ListEmptyComponent={<Vazio texto="Nenhuma trilha cadastrada" icone="git-network-outline" />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          {item.categoria && <Text style={styles.categoria}>{item.categoria.nome}</Text>}
          {item.descricao ? <Text style={styles.descricao}>{item.descricao}</Text> : null}

          {item.cursos?.length === 0 && <Text style={styles.descricao}>Nenhum curso nesta trilha ainda.</Text>}
          {item.cursos?.map((tc, i) => (
            <TouchableOpacity
              key={tc.idCurso}
              style={styles.curso}
              onPress={() => navigation.navigate('CursoDetalhe', { idCurso: tc.idCurso })}
            >
              <Text style={styles.ordem}>{i + 1}</Text>
              <View style={styles.cursoTexto}>
                <Text style={styles.cursoTitulo}>{tc.curso?.titulo}</Text>
                <Text style={styles.cursoInfo}>
                  {tc.curso?.nivel} · {tc.curso && tc.curso.preco > 0 ? formatarPreco(tc.curso.preco) : 'Gratuito'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.cinza} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 12, backgroundColor: cores.branco, gap: 6 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: cores.texto },
  categoria: { color: cores.primaria, fontWeight: 'bold', fontSize: 12 },
  descricao: { color: cores.texto },
  curso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  ordem: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    color: cores.branco,
    fontWeight: 'bold',
    backgroundColor: cores.primaria,
  },
  cursoTexto: { flex: 1 },
  cursoTitulo: { color: cores.texto, fontWeight: 'bold' },
  cursoInfo: { color: cores.cinza, fontSize: 12 },
});
