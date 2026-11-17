import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import PagamentoScreen from '../screens/PagamentoScreen';
import CursoDetalheScreen from '../screens/CursoDetalheScreen';
import AulasScreen from '../screens/AulasScreen';
import GerCursosScreen from '../screens/gerenciar/GerCursosScreen';
import GerConteudoScreen from '../screens/gerenciar/GerConteudoScreen';
import GerUsuariosScreen from '../screens/gerenciar/GerUsuariosScreen';
import GerCategoriasScreen from '../screens/gerenciar/GerCategoriasScreen';
import GerTrilhasScreen from '../screens/gerenciar/GerTrilhasScreen';
import GerMatriculasScreen from '../screens/gerenciar/GerMatriculasScreen';
import GerProgressoScreen from '../screens/gerenciar/GerProgressoScreen';
import GerAvaliacoesScreen from '../screens/gerenciar/GerAvaliacoesScreen';
import GerCertificadosScreen from '../screens/gerenciar/GerCertificadosScreen';
import GerFinanceiroScreen from '../screens/gerenciar/GerFinanceiroScreen';
import TabRoutes from './TabRoutes';
import { cores } from '../styles/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Cadastro' }} />
      {/* Principal é o navegador de abas (navegação aninhada) */}
      <Stack.Screen name="Principal" component={TabRoutes} options={{ headerShown: false }} />
      {/* Telas que ficam por cima das abas, com seta de voltar */}
      <Stack.Screen name="CursoDetalhe" component={CursoDetalheScreen} options={{ title: 'Curso' }} />
      <Stack.Screen name="Pagamento" component={PagamentoScreen} options={{ title: 'Pagamento' }} />
      <Stack.Screen name="Aulas" component={AulasScreen} />

      {/* Telas do menu "Gerenciar" (Admin e Autor) */}
      <Stack.Screen name="GerCursos" component={GerCursosScreen} options={{ title: 'Cursos' }} />
      <Stack.Screen name="GerConteudo" component={GerConteudoScreen} options={{ title: 'Módulos e Aulas' }} />
      <Stack.Screen name="GerUsuarios" component={GerUsuariosScreen} options={{ title: 'Usuários' }} />
      <Stack.Screen name="GerCategorias" component={GerCategoriasScreen} options={{ title: 'Categorias' }} />
      <Stack.Screen name="GerTrilhas" component={GerTrilhasScreen} options={{ title: 'Trilhas' }} />
      <Stack.Screen name="GerMatriculas" component={GerMatriculasScreen} options={{ title: 'Matrículas' }} />
      <Stack.Screen name="GerProgresso" component={GerProgressoScreen} options={{ title: 'Progresso' }} />
      <Stack.Screen name="GerAvaliacoes" component={GerAvaliacoesScreen} options={{ title: 'Avaliações' }} />
      <Stack.Screen name="GerCertificados" component={GerCertificadosScreen} options={{ title: 'Certificados' }} />
      <Stack.Screen name="GerFinanceiro" component={GerFinanceiroScreen} options={{ title: 'Financeiro' }} />
    </Stack.Navigator>
  );
}
