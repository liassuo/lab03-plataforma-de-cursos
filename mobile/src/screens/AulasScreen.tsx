import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Aula, Certificado, Curso, Progresso, RootStackParamList } from '../types';
import { api } from '../services/api';
import { Carregando } from '../components/Formulario';
import { cores } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Aulas'>;

export default function AulasScreen({ route }: Props) {
  const { idCurso } = route.params;
  const [curso, setCurso] = useState<Curso | null>(null);
  const [progresso, setProgresso] = useState<Progresso | null>(null);
  const [certificado, setCertificado] = useState<Certificado | null>(null);

  async function carregar() {
    try {
      const [dadosCurso, dadosProgresso, certificados] = await Promise.all([
        api.get<Curso>(`cursos/${idCurso}`),
        api.get<Progresso>(`progresso/meu/${idCurso}`),
        api.get<Certificado[]>('certificados/meus'),
      ]);
      setCurso(dadosCurso);
      setProgresso(dadosProgresso);
      setCertificado(certificados.find((c) => c.idCurso === idCurso) ?? null);
    } catch (erro) {
      Alert.alert('Erro', (erro as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, [idCurso]);

  // Abre o vídeo da aula no navegador ou no app do YouTube
  function assistir(aula: Aula) {
    if (!aula.urlConteudo) {
      Alert.alert('Aula sem link', 'O autor ainda não cadastrou o link desta aula.');
      return;
    }
    Linking.openURL(aula.urlConteudo);
  }

  async function concluir(aula: Aula) {
    try {
      await api.post('progresso', { idAula: aula.id });
      carregar(); // atualiza a barra de progresso
    } catch (erro) {
      Alert.alert('Erro', (erro as Error).message);
    }
  }

  async function emitirCertificado() {
    try {
      setCertificado(await api.post<Certificado>('certificados', { idCurso }));
      Alert.alert('Parabéns!', 'Seu certificado foi emitido.');
    } catch (erro) {
      Alert.alert('Erro', (erro as Error).message);
    }
  }

  if (!curso || !progresso) return <Carregando />;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>{curso.titulo}</Text>

      {/* Barra de progresso: a parte colorida tem a largura do percentual */}
      <View style={styles.cardProgresso}>
        <Text style={styles.texto}>
          {progresso.concluidas} de {progresso.totalAulas} aulas concluídas ({progresso.percentual}%)
        </Text>
        <View style={styles.barra}>
          <View style={[styles.barraPreenchida, { width: `${progresso.percentual}%` }]} />
        </View>
      </View>

      {/* Certificado: liberado quando o curso chega a 100% */}
      {progresso.percentual === 100 && (
        <View style={styles.cardCertificado}>
          {certificado ? (
            <>
              <Text style={styles.certificadoTitulo}>Certificado emitido</Text>
              <Text style={styles.texto}>Código: {certificado.codigoVerificacao}</Text>
              <Text style={styles.texto}>
                Emitido em {new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}
              </Text>
            </>
          ) : (
            <TouchableOpacity style={styles.botaoCertificado} onPress={emitirCertificado}>
              <Text style={styles.botaoTexto}>EMITIR CERTIFICADO</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {curso.modulos?.map((modulo) => (
        <View key={modulo.id} style={styles.modulo}>
          <Text style={styles.moduloTitulo}>{modulo.ordem}. {modulo.titulo}</Text>

          {modulo.aulas.map((aula) => {
            const concluida = progresso.aulasConcluidas.includes(aula.id);
            return (
              <View key={aula.id} style={styles.aula}>
                <Ionicons
                  name={concluida ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={concluida ? cores.sucesso : cores.cinza}
                />
                {/* flex: 1 faz o texto ocupar o espaço entre o ícone e os botões */}
                <View style={styles.aulaInfo}>
                  <Text style={styles.texto}>{aula.titulo}</Text>
                  <Text style={styles.aulaDuracao}>{aula.tipoConteudo} · {aula.duracaoMinutos} min</Text>
                </View>
                <TouchableOpacity style={styles.botaoPequeno} onPress={() => assistir(aula)}>
                  <Text style={styles.botaoPequenoTexto}>Assistir</Text>
                </TouchableOpacity>
                {!concluida && (
                  <TouchableOpacity style={styles.botaoPequeno} onPress={() => concluir(aula)}>
                    <Text style={styles.botaoPequenoTexto}>Concluir</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, gap: 12 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto },
  texto: { color: cores.texto },
  cardProgresso: { padding: 16, borderRadius: 12, backgroundColor: cores.branco, gap: 10 },
  barra: { height: 10, borderRadius: 5, backgroundColor: cores.borda, overflow: 'hidden' },
  barraPreenchida: { height: '100%', backgroundColor: cores.sucesso },
  cardCertificado: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.sucesso,
    backgroundColor: cores.branco,
    gap: 4,
  },
  certificadoTitulo: { fontSize: 16, fontWeight: 'bold', color: cores.sucesso },
  botaoCertificado: {
    height: 50,
    borderRadius: 10,
    backgroundColor: cores.sucesso,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
  modulo: { padding: 14, borderRadius: 12, backgroundColor: cores.branco, gap: 10 },
  moduloTitulo: { fontWeight: 'bold', color: cores.texto },
  aula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  aulaInfo: { flex: 1 },
  aulaDuracao: { fontSize: 12, color: cores.cinza },
  botaoPequeno: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  botaoPequenoTexto: { fontSize: 12, color: cores.primaria, fontWeight: 'bold' },
});
