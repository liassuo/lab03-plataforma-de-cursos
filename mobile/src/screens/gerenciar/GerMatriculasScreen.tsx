import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Curso, Matricula, Usuario } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { formatarData, avisar, faltaPreencher, tentar } from '../../utils';

export default function GerMatriculasScreen() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idCurso, setIdCurso] = useState<number | null>(null);

  function carregar() {
    tentar(async () => {
      setMatriculas(await api.get<Matricula[]>('matriculas'));
      const usuarios = await api.get<Usuario[]>('usuarios');
      setAlunos(usuarios.filter((u) => u.tipo === 'ALUNO'));
      setCursos(await api.get<Curso[]>('cursos'));
    });
  }

  useEffect(carregar, []);

  function matricular() {
    if (faltaPreencher([['Aluno', idUsuario], ['Curso', idCurso]])) return;
    tentar(async () => {
      await api.post('matriculas', { idUsuario, idCurso });
      setIdCurso(null);
      avisar('Aluno matriculado');
      carregar();
    });
  }

  function remover(matricula: Matricula) {
    confirmarRemocao(`a matrícula de ${matricula.usuario?.nomeCompleto}`, () =>
      tentar(async () => {
        await api.delete(`matriculas/${matricula.id}`);
        avisar('Matrícula removida');
        carregar();
      }),
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario titulo="Nova matrícula">
        <Seletor rotulo="Aluno" opcoes={alunos.map((u) => ({ valor: u.id, texto: u.nomeCompleto }))} valor={idUsuario} aoMudar={setIdUsuario} />
        <Seletor rotulo="Curso" opcoes={cursos.map((c) => ({ valor: c.id, texto: c.titulo }))} valor={idCurso} aoMudar={setIdCurso} />
        <Botao texto="MATRICULAR" aoTocar={matricular} />
      </CartaoFormulario>

      <Text style={e.secao}>Matrículas ({matriculas.length})</Text>
      {matriculas.length === 0 && <Vazio texto="Nenhuma matrícula" />}
      {matriculas.map((matricula) => (
        <View key={matricula.id} style={e.cartao}>
          <Text style={e.titulo}>{matricula.usuario?.nomeCompleto}</Text>
          <Text style={e.texto}>{matricula.curso.titulo}</Text>
          <Text style={e.detalhe}>
            Matriculado em {formatarData(matricula.dataMatricula)}
            {matricula.dataConclusao ? ` · concluído em ${formatarData(matricula.dataConclusao)}` : ' · em andamento'}
          </Text>
          <Botao texto="Remover" tipo="perigo" aoTocar={() => remover(matricula)} />
        </View>
      ))}
    </ScrollView>
  );
}
