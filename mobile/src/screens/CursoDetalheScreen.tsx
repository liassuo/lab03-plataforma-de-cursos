import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Curso, Matricula, RootStackParamList } from '../types';
import { api, obterUsuario } from '../services/api';
import { cores } from '../styles/theme';
import { formatarPreco } from '../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'CursoDetalhe'>;

export default function CursoDetalheScreen({ route, navigation }: Props) {
  const { idCurso } = route.params;
  const [curso, setCurso] = useState<Curso | null>(null);
  const [matriculado, setMatriculado] = useState(false);
  const aluno = obterUsuario().tipo === 'ALUNO';

  useEffect(() => {
    api.get<Curso>(`cursos/${idCurso}`)
      .then((dados) => {
        setCurso(dados);
        navigation.setOptions({ title: dados.titulo }); // título do cabeçalho
      })
      .catch((erro) => Alert.alert('Erro', erro.message));

  }, [idCurso]);

  // Verifica se o aluno já comprou este curso (de novo ao voltar da tela de pagamento)
  useFocusEffect(
    useCallback(() => {
      if (!aluno) return;
      api.get<Matricula[]>('matriculas/minhas')
        .then((lista) => setMatriculado(lista.some((m) => m.idCurso === idCurso)))
        .catch((erro) => Alert.alert('Erro', erro.message));
    }, [idCurso]),
  );

  if (!curso) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>{curso.titulo}</Text>
      <Text style={styles.descricao}>{curso.descricao || 'Sem descrição'}</Text>

      {/* Informações lado a lado */}
      <View style={styles.linhaInfo}>
        <View style={styles.info}>
          <Text style={styles.infoValor}>{curso.nivel}</Text>
          <Text style={styles.infoRotulo}>Nível</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.infoValor}>{curso.totalAulas}</Text>
          <Text style={styles.infoRotulo}>Aulas</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.infoValor}>{curso.totalHoras}h</Text>
          <Text style={styles.infoRotulo}>Duração</Text>
        </View>
      </View>

      <Text style={styles.texto}>Categoria: {curso.categoria?.nome}</Text>
      <Text style={styles.texto}>Instrutor: {curso.instrutor?.nomeCompleto}</Text>
      <Text style={styles.texto}>
        Atualizado em {new Date(curso.dataAtualizacao).toLocaleDateString('pt-BR')}
      </Text>

      {/* Só o aluno compra cursos */}
      {aluno && !matriculado && (
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Pagamento', { idCurso })}>
          <Text style={styles.botaoTexto}>
            {curso.preco > 0 ? `COMPRAR POR ${formatarPreco(curso.preco)}` : 'MATRICULAR GRÁTIS'}
          </Text>
        </TouchableOpacity>
      )}
      {aluno && matriculado && (
        <>
          <Text style={styles.matriculado}>Você está matriculado neste curso</Text>
          <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Aulas', { idCurso })}>
            <Text style={styles.botaoTexto}>ACESSAR AULAS</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.secao}>Conteúdo do curso</Text>
      {curso.modulos?.length === 0 && <Text style={styles.texto}>Nenhum módulo cadastrado ainda.</Text>}

      {curso.modulos?.map((modulo) => (
        <View key={modulo.id} style={styles.modulo}>
          <Text style={styles.moduloTitulo}>{modulo.ordem}. {modulo.titulo}</Text>
          {modulo.aulas.map((aula) => (
            <View key={aula.id} style={styles.aula}>
              <Text style={styles.aulaTitulo}>{aula.titulo}</Text>
              <Text style={styles.aulaDuracao}>{aula.duracaoMinutos} min</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carregando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, gap: 10 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto },
  descricao: { color: cores.texto, lineHeight: 20 },
  linhaInfo: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  info: {
    flex: 1, // os três quadros dividem a largura igualmente
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: cores.branco,
  },
  infoValor: { fontWeight: 'bold', color: cores.primaria },
  infoRotulo: { fontSize: 12, color: cores.cinza },
  texto: { color: cores.texto },
  botao: {
    height: 50,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
  matriculado: { marginTop: 8, textAlign: 'center', color: cores.sucesso, fontWeight: 'bold' },
  secao: { fontSize: 18, fontWeight: 'bold', color: cores.texto, marginTop: 12 },
  modulo: { padding: 14, borderRadius: 10, backgroundColor: cores.branco, gap: 6 },
  moduloTitulo: { fontWeight: 'bold', color: cores.texto },
  aula: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  aulaTitulo: { flexShrink: 1, color: cores.texto },
  aulaDuracao: { color: cores.cinza },
});
