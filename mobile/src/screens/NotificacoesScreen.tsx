import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Notificacao } from '../types';
import { api } from '../services/api';
import { aoReceberNotificacao } from '../services/socket';
import { Carregando, Vazio } from '../components/Formulario';
import { cores } from '../styles/theme';
import { tentar } from '../utils';

export default function NotificacoesScreen() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[] | null>(null); // null = carregando

  async function carregar() {
    await tentar(async () => {
      setNotificacoes(await api.get<Notificacao[]>('notificacoes/minhas'));
      // Abriu a tela: todas passam a contar como lidas no backend
      await api.post('notificacoes/lidas');
    });
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, []),
  );

  // Enquanto a tela está aberta, a notificação nova entra no topo da lista
  // e já é marcada como lida, porque o usuário está vendo
  useEffect(() => {
    return aoReceberNotificacao((nova) => {
      setNotificacoes((lista) => [nova, ...(lista ?? [])]);
      api.post('notificacoes/lidas').catch(() => {});
    });
  }, []);

  if (!notificacoes) return <Carregando />;

  return (
    <FlatList
      style={styles.tela}
      data={notificacoes}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={<Vazio icone="notifications-off-outline" texto="Nenhuma notificação por enquanto" />}
      renderItem={({ item }) => (
        // Não lidas ficam com a borda colorida à esquerda
        <View style={[styles.card, !item.lida && styles.naoLida]}>
          <Ionicons name="notifications" size={20} color={item.lida ? cores.cinza : cores.primaria} />
          <View style={styles.textos}>
            <Text style={styles.mensagem}>{item.mensagem}</Text>
            <Text style={styles.data}>{new Date(item.dataCriacao).toLocaleString('pt-BR')}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: cores.branco,
  },
  naoLida: { borderLeftWidth: 4, borderLeftColor: cores.primaria },
  textos: { flex: 1, gap: 4 },
  mensagem: { color: cores.texto },
  data: { fontSize: 12, color: cores.cinza },
});
