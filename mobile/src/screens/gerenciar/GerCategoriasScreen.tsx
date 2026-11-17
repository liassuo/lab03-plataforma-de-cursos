import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Categoria, Curso } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Botao, Campo, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { avisar, faltaPreencher, tentar } from '../../utils';

export default function GerCategoriasScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  function carregar() {
    tentar(async () => {
      setCategorias(await api.get<Categoria[]>('categorias'));
      setCursos(await api.get<Curso[]>('cursos'));
    });
  }

  useEffect(carregar, []);

  function cadastrar() {
    if (faltaPreencher([['Nome', nome]])) return;
    tentar(async () => {
      await api.post('categorias', { nome, descricao });
      setNome('');
      setDescricao('');
      avisar('Categoria cadastrada');
      carregar();
    });
  }

  function remover(categoria: Categoria) {
    confirmarRemocao(`a categoria "${categoria.nome}" (os cursos dela também serão removidos)`, () =>
      tentar(async () => {
        await api.delete(`categorias/${categoria.id}`);
        avisar('Categoria removida');
        carregar();
      }),
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario titulo="Nova categoria">
        <Campo rotulo="Nome" value={nome} onChangeText={setNome} />
        <Campo rotulo="Descrição" value={descricao} onChangeText={setDescricao} />
        <Botao texto="CADASTRAR" aoTocar={cadastrar} />
      </CartaoFormulario>

      <Text style={e.secao}>Categorias</Text>
      {categorias.map((categoria) => (
        <View key={categoria.id} style={e.cartao}>
          <Text style={e.titulo}>{categoria.nome}</Text>
          <Text style={e.detalhe}>{categoria.descricao || 'Sem descrição'}</Text>
          <Text style={e.detalhe}>
            {cursos.filter((c) => c.idCategoria === categoria.id).length} curso(s)
          </Text>
          <Botao texto="Remover" tipo="perigo" aoTocar={() => remover(categoria)} />
        </View>
      ))}
    </ScrollView>
  );
}
