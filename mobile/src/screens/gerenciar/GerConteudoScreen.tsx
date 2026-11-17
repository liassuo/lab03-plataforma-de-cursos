import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Aula, Curso, Modulo } from '../../types';
import { api, obterUsuario } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Campo, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { avisar, faltaPreencher, tentar } from '../../utils';

const tipos = ['Video', 'Texto', 'Quiz'];

export default function GerConteudoScreen() {
  const usuario = obterUsuario();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [idCurso, setIdCurso] = useState<number | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);

  const [tituloModulo, setTituloModulo] = useState('');

  // Formulário da aula
  const [idModulo, setIdModulo] = useState<number | null>(null);
  const [tituloAula, setTituloAula] = useState('');
  const [tipoAula, setTipoAula] = useState('Video');
  const [duracao, setDuracao] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    tentar(async () => {
      const lista = await api.get<Curso[]>('cursos');
      // O autor só gerencia o conteúdo dos próprios cursos
      setCursos(usuario.tipo === 'AUTOR' ? lista.filter((c) => c.idInstrutor === usuario.id) : lista);
    });
  }, []);

  function carregarCurso(id: number) {
    setIdCurso(id);
    setIdModulo(null);
    tentar(async () => setCurso(await api.get<Curso>(`cursos/${id}`)));
  }

  function adicionarModulo() {
    if (faltaPreencher([['Título do módulo', tituloModulo]])) return;
    tentar(async () => {
      await api.post('modulos', { idCurso, titulo: tituloModulo });
      setTituloModulo('');
      avisar('Módulo adicionado');
      carregarCurso(idCurso as number);
    });
  }

  function adicionarAula() {
    if (faltaPreencher([['Módulo', idModulo], ['Título da aula', tituloAula], ['Duração', duracao]])) return;
    tentar(async () => {
      // Aula nova também avisa os alunos matriculados (Kafka)
      await api.post('aulas', {
        idModulo,
        titulo: tituloAula,
        tipoConteudo: tipoAula,
        duracaoMinutos: Number(duracao),
        urlConteudo: url,
      });
      setTituloAula('');
      setDuracao('');
      setUrl('');
      avisar('Aula adicionada');
      carregarCurso(idCurso as number);
    });
  }

  function removerModulo(modulo: Modulo) {
    confirmarRemocao(`o módulo "${modulo.titulo}" e as aulas dele`, () =>
      tentar(async () => {
        await api.delete(`modulos/${modulo.id}`);
        avisar('Módulo removido');
        carregarCurso(idCurso as number);
      }),
    );
  }

  function removerAula(aula: Aula) {
    confirmarRemocao(`a aula "${aula.titulo}"`, () =>
      tentar(async () => {
        await api.delete(`aulas/${aula.id}`);
        avisar('Aula removida');
        carregarCurso(idCurso as number);
      }),
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <Seletor
        rotulo="Curso"
        opcoes={cursos.map((c) => ({ valor: c.id, texto: c.titulo }))}
        valor={idCurso}
        aoMudar={carregarCurso}
      />

      {!curso && <Vazio texto="Escolha um curso para ver o conteúdo" />}

      {curso && (
        <>
          <CartaoFormulario titulo="Novo módulo">
            <Campo rotulo="Título do módulo" value={tituloModulo} onChangeText={setTituloModulo} />
            <Botao texto="ADICIONAR MÓDULO" aoTocar={adicionarModulo} />
          </CartaoFormulario>

          {curso.modulos && curso.modulos.length > 0 && (
            <CartaoFormulario titulo="Nova aula">
              <Seletor
                rotulo="Módulo"
                opcoes={curso.modulos.map((m) => ({ valor: m.id, texto: `${m.ordem}. ${m.titulo}` }))}
                valor={idModulo}
                aoMudar={setIdModulo}
              />
              <Campo rotulo="Título da aula" value={tituloAula} onChangeText={setTituloAula} />
              <Seletor rotulo="Tipo" opcoes={tipos.map((t) => ({ valor: t, texto: t }))} valor={tipoAula} aoMudar={setTipoAula} />
              <Campo rotulo="Duração (minutos)" value={duracao} onChangeText={setDuracao} keyboardType="numeric" />
              <Campo rotulo="Link do conteúdo" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" />
              <Botao texto="ADICIONAR AULA" aoTocar={adicionarAula} />
            </CartaoFormulario>
          )}

          <Text style={e.secao}>Conteúdo de "{curso.titulo}"</Text>
          {curso.modulos?.length === 0 && <Vazio texto="Nenhum módulo cadastrado" />}

          {curso.modulos?.map((modulo) => (
            <View key={modulo.id} style={e.cartao}>
              <View style={e.linha}>
                <Text style={[e.titulo, { flexShrink: 1 }]}>{modulo.ordem}. {modulo.titulo}</Text>
                <Botao texto="Remover" tipo="perigo" aoTocar={() => removerModulo(modulo)} />
              </View>
              {modulo.aulas.length === 0 && <Text style={e.detalhe}>Sem aulas</Text>}
              {modulo.aulas.map((aula) => (
                <View key={aula.id} style={e.linha}>
                  <View style={{ flex: 1 }}>
                    <Text style={e.texto}>{aula.ordem}. {aula.titulo}</Text>
                    <Text style={e.detalhe}>{aula.tipoConteudo} · {aula.duracaoMinutos} min</Text>
                  </View>
                  <Botao texto="X" tipo="contorno" aoTocar={() => removerAula(aula)} />
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
