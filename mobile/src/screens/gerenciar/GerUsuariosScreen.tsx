import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TipoUsuario, Usuario } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Botao, Campo, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { formatarData, avisar, faltaPreencher, tentar } from '../../utils';

const perfis = [
  { valor: 'ALUNO', texto: 'Aluno' },
  { valor: 'AUTOR', texto: 'Autor' },
  { valor: 'ADMIN', texto: 'Admin' },
];

export default function GerUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function carregar() {
    tentar(async () => setUsuarios(await api.get<Usuario[]>('usuarios')));
  }

  useEffect(carregar, []);

  function cadastrar() {
    if (faltaPreencher([['Nome', nome], ['E-mail', email], ['Senha', senha]])) return;
    tentar(async () => {
      // O cadastro sempre cria um ALUNO; o perfil é trocado na lista abaixo
      await api.post('usuarios', { nomeCompleto: nome, email, senha });
      setNome('');
      setEmail('');
      setSenha('');
      avisar('Usuário cadastrado');
      carregar();
    });
  }

  function alterarPerfil(usuario: Usuario, tipo: TipoUsuario) {
    tentar(async () => {
      await api.put(`usuarios/${usuario.id}`, { tipo });
      avisar('Perfil alterado');
      carregar();
    });
  }

  function remover(usuario: Usuario) {
    confirmarRemocao(`o usuário "${usuario.nomeCompleto}"`, () =>
      tentar(async () => {
        await api.delete(`usuarios/${usuario.id}`);
        avisar('Usuário removido');
        carregar();
      }),
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario titulo="Novo usuário">
        <Campo rotulo="Nome completo" value={nome} onChangeText={setNome} />
        <Campo rotulo="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
        <Botao texto="CADASTRAR" aoTocar={cadastrar} />
      </CartaoFormulario>

      <Text style={e.secao}>Usuários ({usuarios.length})</Text>
      {usuarios.map((usuario) => (
        <View key={usuario.id} style={e.cartao}>
          <Text style={e.titulo}>{usuario.nomeCompleto}</Text>
          <Text style={e.detalhe}>{usuario.email} · desde {formatarData(usuario.dataCadastro)}</Text>
          <Seletor rotulo="Perfil" opcoes={perfis} valor={usuario.tipo} aoMudar={(tipo) => alterarPerfil(usuario, tipo)} />
          <Botao texto="Remover" tipo="perigo" aoTocar={() => remover(usuario)} />
        </View>
      ))}
    </ScrollView>
  );
}
