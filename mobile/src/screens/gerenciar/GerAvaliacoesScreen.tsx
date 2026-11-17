import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Avaliacao, Curso, Usuario } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Campo, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { avisar, faltaPreencher, tentar } from '../../utils';

// Ex: nota 3 -> "★★★☆☆"
function estrelas(nota: number) {
  return '★'.repeat(nota) + '☆'.repeat(5 - nota);
}

export default function GerAvaliacoesScreen() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idCurso, setIdCurso] = useState<number | null>(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  function carregar() {
    tentar(async () => {
      setAvaliacoes(await api.get<Avaliacao[]>('avaliacoes'));
      const usuarios = await api.get<Usuario[]>('usuarios');
      setAlunos(usuarios.filter((u) => u.tipo === 'ALUNO'));
      setCursos(await api.get<Curso[]>('cursos'));
    });
  }

  useEffect(carregar, []);

  function cadastrar() {
    if (faltaPreencher([['Aluno', idUsuario], ['Curso', idCurso]])) return;
    tentar(async () => {
      await api.post('avaliacoes', { idUsuario, idCurso, nota, comentario });
      setComentario('');
      avisar('Avaliação cadastrada');
      carregar();
    });
  }

  function remover(avaliacao: Avaliacao) {
    confirmarRemocao('esta avaliação', () =>
      tentar(async () => {
        await api.delete(`avaliacoes/${avaliacao.id}`);
        avisar('Avaliação removida');
        carregar();
      }),
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario titulo="Nova avaliação">
        <Seletor rotulo="Aluno" opcoes={alunos.map((u) => ({ valor: u.id, texto: u.nomeCompleto }))} valor={idUsuario} aoMudar={setIdUsuario} />
        <Seletor rotulo="Curso" opcoes={cursos.map((c) => ({ valor: c.id, texto: c.titulo }))} valor={idCurso} aoMudar={setIdCurso} />
        <Seletor rotulo="Nota" opcoes={[1, 2, 3, 4, 5].map((n) => ({ valor: n, texto: estrelas(n) }))} valor={nota} aoMudar={setNota} />
        <Campo rotulo="Comentário" value={comentario} onChangeText={setComentario} multiline />
        <Botao texto="CADASTRAR" aoTocar={cadastrar} />
      </CartaoFormulario>

      <Text style={e.secao}>Avaliações</Text>
      {avaliacoes.length === 0 && <Vazio texto="Nenhuma avaliação" />}
      {avaliacoes.map((avaliacao) => (
        <View key={avaliacao.id} style={e.cartao}>
          <Text style={e.titulo}>{estrelas(avaliacao.nota)}  {avaliacao.curso?.titulo}</Text>
          <Text style={e.texto}>{avaliacao.comentario || 'Sem comentário'}</Text>
          <Text style={e.detalhe}>{avaliacao.usuario?.nomeCompleto}</Text>
          <Botao texto="Remover" tipo="perigo" aoTocar={() => remover(avaliacao)} />
        </View>
      ))}
    </ScrollView>
  );
}
