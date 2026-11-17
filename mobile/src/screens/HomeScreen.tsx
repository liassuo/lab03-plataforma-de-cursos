import { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList, TabProps } from '../types';
import { api, fazerLogout, obterUsuario } from '../services/api';
import { cores } from '../styles/theme';

const nomesDosTipos = { ALUNO: 'Aluno', AUTOR: 'Autor', ADMIN: 'Administrador' };

// Pega as iniciais do nome (ex: "Maria Silva" -> "MS")
function iniciais(nome: string) {
  const partes = nome.trim().split(' ');
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

// Atalho da tela inicial: abre uma aba ou uma tela da pilha
interface Atalho {
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  aba?: keyof TabParamList;
  tela?: keyof RootStackParamList;
}

// Cada perfil tem atalhos para o que mais usa
const atalhosPorTipo: Record<string, Atalho[]> = {
  ALUNO: [
    { titulo: 'Cursos disponíveis', icone: 'book-outline', aba: 'Cursos' },
    { titulo: 'Meus cursos', icone: 'school-outline', aba: 'MeusCursos' },
    { titulo: 'Avisos', icone: 'notifications-outline', aba: 'Notificacoes' },
  ],
  AUTOR: [
    { titulo: 'Meus cursos', icone: 'book-outline', tela: 'GerCursos' },
    { titulo: 'Módulos e aulas', icone: 'list-outline', tela: 'GerConteudo' },
    { titulo: 'Avisos', icone: 'notifications-outline', aba: 'Notificacoes' },
  ],
  ADMIN: [
    { titulo: 'Gerenciar', icone: 'construct-outline', aba: 'Gerenciar' },
    { titulo: 'Usuários', icone: 'people-outline', tela: 'GerUsuarios' },
    { titulo: 'Cursos', icone: 'book-outline', tela: 'GerCursos' },
  ],
};

export default function HomeScreen({ navigation }: TabProps<'Inicio'>) {
  const usuario = obterUsuario();
  const primeiroNome = usuario.nomeCompleto.split(' ')[0];
  const admin = usuario.tipo === 'ADMIN';

  // Painel do Admin: os mesmos números do "Painel Geral" da web
  const [painel, setPainel] = useState<{ rotulo: string; valor: number }[]>([]);

  useEffect(() => {
    if (!admin) return;
    Promise.all([
      api.get<unknown[]>('usuarios'),
      api.get<unknown[]>('cursos'),
      api.get<unknown[]>('matriculas'),
      api.get<unknown[]>('certificados'),
    ])
      .then(([usuarios, cursos, matriculas, certificados]) =>
        setPainel([
          { rotulo: 'Usuários', valor: usuarios.length },
          { rotulo: 'Cursos', valor: cursos.length },
          { rotulo: 'Matrículas', valor: matriculas.length },
          { rotulo: 'Certificados', valor: certificados.length },
        ]),
      )
      .catch(() => {});
  }, []);

  // Botão "sair" no canto direito do cabeçalho
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida}>
          <Ionicons name="log-out-outline" size={24} color={cores.branco} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  function confirmarSaida() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  function sair() {
    fazerLogout();
    // getParent: sobe das abas para a pilha principal
    // reset: a pilha fica só com o Login, então o botão voltar não retorna para cá
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  function abrir(atalho: Atalho) {
    if (atalho.aba) navigation.navigate(atalho.aba);
    else if (atalho.tela) navigation.navigate(atalho.tela as any);
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {/* Cartão do usuário: avatar à esquerda, nome e perfil à direita */}
      <View style={styles.cartaoUsuario}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{iniciais(usuario.nomeCompleto)}</Text>
        </View>
        <View style={styles.dados}>
          <Text style={styles.ola}>Olá, {primeiroNome}!</Text>
          <Text style={styles.email}>{usuario.email}</Text>
          <Text style={styles.perfil}>{nomesDosTipos[usuario.tipo]}</Text>
        </View>
      </View>

      {/* Grade 2 x 2 com flexWrap: cada quadro ocupa quase metade da largura */}
      {admin && painel.length > 0 && (
        <>
          <Text style={styles.secao}>Resumo da plataforma</Text>
          <View style={styles.grade}>
            {painel.map((item) => (
              <View key={item.rotulo} style={styles.painelItem}>
                <Text style={styles.painelValor}>{item.valor}</Text>
                <Text style={styles.painelRotulo}>{item.rotulo}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.secao}>Atalhos</Text>
      <View style={styles.grade}>
        {atalhosPorTipo[usuario.tipo].map((atalho) => (
          <TouchableOpacity key={atalho.titulo} style={styles.atalho} onPress={() => abrir(atalho)}>
            <Ionicons name={atalho.icone} size={28} color={cores.primaria} />
            <Text style={styles.atalhoTexto}>{atalho.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, gap: 12 },
  botaoSair: { marginRight: 16 },
  cartaoUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    backgroundColor: cores.branco,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 18 },
  dados: { flex: 1, gap: 2 },
  ola: { fontSize: 20, fontWeight: 'bold', color: cores.texto },
  email: { color: cores.cinza },
  perfil: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 12,
    color: cores.branco,
    backgroundColor: cores.primaria,
  },
  secao: { fontSize: 16, fontWeight: 'bold', color: cores.texto, marginTop: 8 },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  painelItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: cores.branco,
    alignItems: 'center',
  },
  painelValor: { fontSize: 24, fontWeight: 'bold', color: cores.primaria },
  painelRotulo: { color: cores.cinza },
  atalho: {
    width: '48%',
    aspectRatio: 1.4, // retângulo um pouco mais largo que alto
    borderRadius: 12,
    backgroundColor: cores.branco,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  atalhoTexto: { color: cores.texto, fontWeight: 'bold', textAlign: 'center' },
});
