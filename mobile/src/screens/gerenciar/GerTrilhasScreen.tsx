import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Categoria, Curso, Trilha } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Campo, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { avisar, faltaPreencher, tentar } from '../../utils';

export default function GerTrilhasScreen() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  // Nova trilha
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | null>(null);

  // Adicionar curso em uma trilha
  const [idTrilha, setIdTrilha] = useState<number | null>(null);
  const [idCurso, setIdCurso] = useState<number | null>(null);

  function carregar() {
    tentar(async () => {
      setTrilhas(await api.get<Trilha[]>('trilhas'));
      setCategorias(await api.get<Categoria[]>('categorias'));
      setCursos(await api.get<Curso[]>('cursos'));
    });
  }

  useEffect(carregar, []);

  function cadastrar() {
    if (faltaPreencher([['Título', titulo], ['Categoria', idCategoria]])) return;
    tentar(async () => {
      await api.post('trilhas', { titulo, descricao, idCategoria });
      setTitulo('');
      setDescricao('');
      avisar('Trilha cadastrada');
      carregar();
    });
  }

  function adicionarCurso() {
    if (faltaPreencher([['Trilha', idTrilha], ['Curso', idCurso]])) return;
    tentar(async () => {
      await api.post(`trilhas/${idTrilha}/cursos`, { idCurso });
      setIdCurso(null);
      avisar('Curso adicionado à trilha');
      carregar();
    });
  }

  function removerCurso(trilha: Trilha, idCursoTrilha: number) {
    tentar(async () => {
      await api.delete(`trilhas/${trilha.id}/cursos/${idCursoTrilha}`);
      carregar();
    });
  }

  function remover(trilha: Trilha) {
    confirmarRemocao(`a trilha "${trilha.titulo}"`, () =>
      tentar(async () => {
        await api.delete(`trilhas/${trilha.id}`);
        avisar('Trilha removida');
        carregar();
      }),
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario titulo="Nova trilha">
        <Campo rotulo="Título" value={titulo} onChangeText={setTitulo} />
        <Campo rotulo="Descrição" value={descricao} onChangeText={setDescricao} />
        <Seletor
          rotulo="Categoria"
          opcoes={categorias.map((c) => ({ valor: c.id, texto: c.nome }))}
          valor={idCategoria}
          aoMudar={setIdCategoria}
        />
        <Botao texto="CADASTRAR" aoTocar={cadastrar} />
      </CartaoFormulario>

      {trilhas.length > 0 && (
        <CartaoFormulario titulo="Adicionar curso a uma trilha">
          <Seletor rotulo="Trilha" opcoes={trilhas.map((t) => ({ valor: t.id, texto: t.titulo }))} valor={idTrilha} aoMudar={setIdTrilha} />
          <Seletor rotulo="Curso" opcoes={cursos.map((c) => ({ valor: c.id, texto: c.titulo }))} valor={idCurso} aoMudar={setIdCurso} />
          <Botao texto="ADICIONAR CURSO" aoTocar={adicionarCurso} />
        </CartaoFormulario>
      )}

      <Text style={e.secao}>Trilhas</Text>
      {trilhas.length === 0 && <Vazio texto="Nenhuma trilha cadastrada" />}
      {trilhas.map((trilha) => (
        <View key={trilha.id} style={e.cartao}>
          <Text style={e.titulo}>{trilha.titulo}</Text>
          <Text style={e.detalhe}>{trilha.categoria?.nome} · {trilha.descricao || 'Sem descrição'}</Text>
          {trilha.cursos?.length === 0 && <Text style={e.detalhe}>Nenhum curso nesta trilha</Text>}
          {trilha.cursos?.map((tc) => (
            <View key={tc.idCurso} style={e.linha}>
              <Text style={[e.texto, { flex: 1 }]}>{tc.ordem}. {tc.curso?.titulo}</Text>
              <Botao texto="X" tipo="contorno" aoTocar={() => removerCurso(trilha, tc.idCurso)} />
            </View>
          ))}
          <Botao texto="Remover trilha" tipo="perigo" aoTocar={() => remover(trilha)} />
        </View>
      ))}
    </ScrollView>
  );
}
