import { ComponentRef, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { fazerLogin } from '../services/api';
import { cores } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  // Referência ao campo de senha, para pular para ele com a tecla "próximo" do teclado
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Informe o e-mail e a senha');
      return;
    }

    setCarregando(true);
    try {
      await fazerLogin(email.trim(), senha);
      // replace: não deixa voltar para o login com o botão voltar
      navigation.replace('Principal');
    } catch (erro) {
      Alert.alert('Erro no login', (erro as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <View style={styles.logo}>
          <Text style={styles.logoTexto}>C</Text>
        </View>
        <Text style={styles.titulo}>Plataforma de Cursos</Text>
        <Text style={styles.subtitulo}>Faça login para continuar</Text>
      </View>

      {/* Formulário */}
      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => campoSenha.current?.focus()}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          ref={campoSenha}
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesativado]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <Text style={styles.botaoTexto}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 32,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTexto: { color: cores.branco, fontSize: 36, fontWeight: 'bold' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: cores.texto },
  subtitulo: { color: cores.cinza },
  formulario: {
    gap: 12,
  },
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
