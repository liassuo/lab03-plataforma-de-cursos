import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Notificacao, TabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import CursosScreen from '../screens/CursosScreen';
import TrilhasScreen from '../screens/TrilhasScreen';
import MeusCursosScreen from '../screens/MeusCursosScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import GerenciarScreen from '../screens/GerenciarScreen';
import { api, obterUsuario } from '../services/api';
import { aoReceberNotificacao } from '../services/socket';
import { cores } from '../styles/theme';

const Tab = createBottomTabNavigator<TabParamList>();

// Nome da aba -> ícone do Ionicons
const icones = {
  Inicio: 'home',
  Cursos: 'book',
  Trilhas: 'git-network',
  MeusCursos: 'school',
  Gerenciar: 'construct',
  Notificacoes: 'notifications',
} as const;

export default function TabRoutes() {
  const aluno = obterUsuario().tipo === 'ALUNO';
  // Admin e Autor ganham a aba "Gerenciar", com as mesmas funções da web
  const gestor = !aluno;
  // Quantidade de notificações não lidas, mostrada em cima do ícone do sino
  const [naoLidas, setNaoLidas] = useState(0);
  // Guarda se a aba de avisos está aberta (useRef não redesenha a tela ao mudar)
  const vendoAvisos = useRef(false);

  useEffect(() => {
    api.get<Notificacao[]>('notificacoes/minhas')
      .then((lista) => setNaoLidas(lista.filter((n) => !n.lida).length))
      .catch(() => {});

    // Tempo real: chegou notificação pelo WebSocket, mostra um alerta e aumenta o contador
    return aoReceberNotificacao((nova) => {
      // Com a aba de avisos aberta, a notificação já aparece na lista
      if (vendoAvisos.current) return;
      setNaoLidas((total) => total + 1);
      Alert.alert('Nova notificação', nova.mensagem);
    });
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Mesmo cabeçalho roxo das outras telas do app
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.cinza,
        // Ícone cheio na aba ativa e contornado nas outras
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? icones[route.name] : `${icones[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Cursos" component={CursosScreen} />
      <Tab.Screen name="Trilhas" component={TrilhasScreen} />
      {/* A aba "Meus cursos" só aparece para o aluno */}
      {aluno && (
        <Tab.Screen name="MeusCursos" component={MeusCursosScreen} options={{ title: 'Meus cursos' }} />
      )}
      {gestor && <Tab.Screen name="Gerenciar" component={GerenciarScreen} />}
      <Tab.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
        options={{ title: 'Avisos', tabBarBadge: naoLidas > 0 ? naoLidas : undefined }}
        // Ao abrir a aba, as notificações são marcadas como lidas
        listeners={{
          focus: () => {
            vendoAvisos.current = true;
            setNaoLidas(0);
          },
          blur: () => {
            vendoAvisos.current = false;
          },
        }}
      />
    </Tab.Navigator>
  );
}
