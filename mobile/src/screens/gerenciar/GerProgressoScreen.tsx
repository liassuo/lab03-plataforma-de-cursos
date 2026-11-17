import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Curso, Usuario } from '../../types';
import { api } from '../../services/api';
import { Vazio, Botao, Seletor, estilosGestao as e } from '../../components/Formulario';
import { cores } from '../../styles/theme';
import { tentar } from '../../utils';

interface Resumo {
  totalAulas: number;
  concluidas: number;
  percentual: number;
}

export default function GerProgressoScreen() {
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idCurso, setIdCurso] = useState<number | null>(null);

  const [curso, setCurso] = useState<Curso | null>(null);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [concluidas, setConcluidas] = useState<number[]>([]);

  useEffect(() => {
    tentar(async () => {
      const usuarios = await api.get<Usuario[]>('usuarios');
      setAlunos(usuarios.filter((u) => u.tipo === 'ALUNO'));
      setCursos(await api.get<Curso[]>('cursos'));
    });
  }, []);

  // Carrega sempre que o aluno ou o curso escolhido mudar
  useEffect(() => {
    if (idUsuario && idCurso) carregar();
  }, [idUsuario, idCurso]);

  function carregar() {
    tentar(async () => {
      setCurso(await api.get<Curso>(`cursos/${idCurso}`));
      setResumo(await api.get<Resumo>(`progresso/resumo/${idUsuario}/${idCurso}`));
      const progresso = await api.get<{ idAula: number; status: string }[]>(
        `progresso?idUsuario=${idUsuario}&idCurso=${idCurso}`,
      );
      setConcluidas(progresso.filter((p) => p.status === 'Concluido').map((p) => p.idAula));
    });
  }

  function alternar(idAula: number) {
    tentar(async () => {
      if (concluidas.includes(idAula)) {
        await api.delete(`progresso/${idUsuario}/${idAula}`);
      } else {
        await api.post('progresso', { idUsuario, idAula });
      }
      carregar();
    });
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo}>
      <Seletor rotulo="Aluno" opcoes={alunos.map((u) => ({ valor: u.id, texto: u.nomeCompleto }))} valor={idUsuario} aoMudar={setIdUsuario} />
      <Seletor rotulo="Curso" opcoes={cursos.map((c) => ({ valor: c.id, texto: c.titulo }))} valor={idCurso} aoMudar={setIdCurso} />

      {(!idUsuario || !idCurso) && <Vazio texto="Escolha um aluno e um curso" />}

      {resumo && curso && idUsuario && idCurso && (
        <>
          <View style={e.cartao}>
            <Text style={e.titulo}>{resumo.percentual}% concluído</Text>
            <Text style={e.detalhe}>{resumo.concluidas} de {resumo.totalAulas} aulas</Text>
          </View>

          {curso.modulos?.map((modulo) => (
            <View key={modulo.id} style={e.cartao}>
              <Text style={e.titulo}>{modulo.ordem}. {modulo.titulo}</Text>
              {modulo.aulas.map((aula) => {
                const feita = concluidas.includes(aula.id);
                return (
                  <View key={aula.id} style={e.linha}>
                    <Ionicons name={feita ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={feita ? cores.sucesso : cores.cinza} />
                    <Text style={[e.texto, { flex: 1 }]}>{aula.titulo}</Text>
                    <Botao texto={feita ? 'Desmarcar' : 'Concluir'} tipo="contorno" aoTocar={() => alternar(aula.id)} />
                  </View>
                );
              })}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
