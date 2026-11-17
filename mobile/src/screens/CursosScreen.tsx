import { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Curso, Matricula, TabProps } from '../types';
import { api, obterUsuario } from '../services/api';
import { Carregando, Vazio } from '../components/Formulario';
import { cores } from '../styles/theme';
import { formatarPreco, tentar } from '../utils';

export default function CursosScreen({ navigation }: TabProps<'Cursos'>) {
  const aluno = obterUsuario().tipo === 'ALUNO';
  const [cursos, setCursos] = useState<Curso[] | null>(null); // null = ainda carregando
  const [comprados, setComprados] = useState<number[]>([]);
  const [busca, setBusca] = useState('');
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    await tentar(async () => {
      setCursos(await api.get<Curso[]>('cursos'));
      // O aluno vê quais cursos já comprou
      if (aluno) {
        const matriculas = await api.get<Matricula[]>('matriculas/minhas');
        setComprados(matriculas.map((m) => m.idCurso));
      }
    });
  }

  // Recarrega sempre que a aba é aberta (pega cursos novos e compras recentes)
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

  if (!cursos) return <Carregando />;

  // Filtra pelo título ou pela categoria, sem diferenciar maiúsculas
  const termo = busca.trim().toLowerCase();
  const filtrados = cursos.filter(
    (c) => c.titulo.toLowerCase().includes(termo) || c.categoria?.nome.toLowerCase().includes(termo),
  );

  return (
    <View style={styles.tela}>
      <View style={styles.busca}>
        <Ionicons name="search" size={18} color={cores.cinza} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar curso ou categoria"
          placeholderTextColor={cores.cinza}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* FlatList: renderiza só os itens visíveis; puxar para baixo recarrega a lista */}
      <FlatList
        data={filtrados}
        keyExtractor={(curso) => String(curso.id)}
        contentContainerStyle={styles.lista}
        refreshing={atualizando}
        onRefresh={puxarParaAtualizar}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Vazio texto={busca ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado'} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CursoDetalhe', { idCurso: item.id })}
          >
            <View style={styles.cardTopo}>
              {/* flexShrink: o título quebra a linha em vez de empurrar o nível para fora */}
              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Text style={styles.nivel}>{item.nivel}</Text>
            </View>
            <Text style={styles.cardInfo}>{item.categoria?.nome} · {item.instrutor?.nomeCompleto}</Text>
            <View style={styles.cardRodape}>
              <Text style={styles.cardInfo}>{item.totalAulas} aula(s) · {item.totalHoras}h</Text>
              {comprados.includes(item.id) ? (
                <Text style={styles.matriculado}>Matriculado</Text>
              ) : (
                <Text style={styles.preco}>{item.preco > 0 ? formatarPreco(item.preco) : 'Gratuito'}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: cores.branco,
  },
  buscaInput: { flex: 1, height: 44, color: cores.texto },
  lista: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 12, backgroundColor: cores.branco, gap: 6 },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitulo: { flexShrink: 1, fontSize: 16, fontWeight: 'bold', color: cores.texto },
  nivel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 12,
    color: cores.branco,
    backgroundColor: cores.primaria,
  },
  cardInfo: { color: cores.cinza },
  cardRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matriculado: { color: cores.sucesso, fontWeight: 'bold', fontSize: 12 },
  preco: { color: cores.primaria, fontWeight: 'bold', fontSize: 12 },
});
