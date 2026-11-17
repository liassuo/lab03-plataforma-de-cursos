import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Matricula, TabProps } from '../types';
import { api } from '../services/api';
import { Botao, Carregando, Vazio } from '../components/Formulario';
import { cores } from '../styles/theme';
import { formatarData, tentar } from '../utils';

export default function MeusCursosScreen({ navigation }: TabProps<'MeusCursos'>) {
  const [matriculas, setMatriculas] = useState<Matricula[] | null>(null); // null = carregando
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    await tentar(async () => setMatriculas(await api.get<Matricula[]>('matriculas/minhas')));
  }

  // Recarrega sempre que a aba é aberta (ex: logo depois de comprar um curso)
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

  if (!matriculas) return <Carregando />;

  return (
    <FlatList
      style={styles.tela}
      data={matriculas}
      keyExtractor={(matricula) => String(matricula.id)}
      contentContainerStyle={styles.lista}
      refreshing={atualizando}
      onRefresh={puxarParaAtualizar}
      ListEmptyComponent={
        <View style={styles.vazio}>
          <Vazio icone="school-outline" texto="Você ainda não está matriculado em nenhum curso." />
          <Botao texto="VER CURSOS DISPONÍVEIS" aoTocar={() => navigation.navigate('Cursos')} />
        </View>
      }
      renderItem={({ item }) => (
        // Toque leva direto para as aulas, que é o que o aluno quer aqui
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Aulas', { idCurso: item.idCurso })}>
          <View style={styles.cardTextos}>
            <Text style={styles.cardTitulo}>{item.curso.titulo}</Text>
            <Text style={styles.cardInfo}>{item.curso.categoria?.nome}</Text>
            <Text style={styles.cardInfo}>Matriculado em {formatarData(item.dataMatricula)}</Text>
            {item.dataConclusao && <Text style={styles.concluido}>Concluído</Text>}
          </View>
          <Ionicons name="play-circle" size={32} color={cores.primaria} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, gap: 12 },
  vazio: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: cores.branco,
  },
  cardTextos: { flex: 1, gap: 4 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: cores.texto },
  cardInfo: { color: cores.cinza },
  concluido: { color: cores.sucesso, fontWeight: 'bold' },
});
