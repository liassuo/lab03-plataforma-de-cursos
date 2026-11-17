import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api, fazerLogin } from '../services/api';
import { cores } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres');
      return;
    }
    if (senha !== confirmacao) {
      Alert.alert('Atenção', 'As senhas não conferem');
      return;
    }

    setCarregando(true);
    try {
      // Rota pública: todo cadastro novo entra como ALUNO.
      // O backend publica o evento "usuario-criado" no Kafka, que gera a notificação de boas-vindas
      await api.post('usuarios', { nomeCompleto: nome.trim(), email: email.trim(), senha });
      // Já entra direto, sem precisar digitar os dados de novo
      await fazerLogin(email.trim(), senha);
      navigation.reset({ index: 0, routes: [{ name: 'Principal' }] });
    } catch (erro) {
      Alert.alert('Erro no cadastro', (erro as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.subtitulo}>Cadastre-se para comprar e assistir cursos</Text>
        </View>

        <View style={styles.formulario}>
          <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            secureTextEntry
            value={confirmacao}
            onChangeText={setConfirmacao}
          />

          <TouchableOpacity
            style={[styles.botao, carregando && styles.botaoDesativado]}
            onPress={handleCadastro}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color={cores.branco} />
            ) : (
              <Text style={styles.botaoTexto}>CADASTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Já tenho conta. Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 32 },
  cabecalho: { alignItems: 'center', gap: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: cores.texto },
  subtitulo: { color: cores.cinza, textAlign: 'center' },
  formulario: { gap: 12 },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  botao: {
    height: 50,
    borderRadius: 10,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: cores.primaria, fontWeight: 'bold', marginTop: 4 },
});
