import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Certificado, Curso, Usuario } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Campo, Seletor, estilosGestao as e } from '../../components/Formulario';
import { formatarData, avisar, faltaPreencher, tentar } from '../../utils';

export default function GerCertificadosScreen() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idCurso, setIdCurso] = useState<number | null>(null);

  const [codigo, setCodigo] = useState('');
  const [verificado, setVerificado] = useState<Certificado | null>(null);

  function carregar() {
    tentar(async () => {
      setCertificados(await api.get<Certificado[]>('certificados'));
      const usuarios = await api.get<Usuario[]>('usuarios');
      setAlunos(usuarios.filter((u) => u.tipo === 'ALUNO'));
      setCursos(await api.get<Curso[]>('cursos'));
    });
  }

  useEffect(carregar, []);

  function emitir() {
    if (faltaPreencher([['Aluno', idUsuario], ['Curso', idCurso]])) return;
    tentar(async () => {
      await api.post('certificados', { idUsuario, idCurso });
      avisar('Certificado emitido');
      carregar();
    });
  }

  function verificar() {
    if (faltaPreencher([['Código', codigo]])) return;
    setVerificado(null);
    tentar(async () => setVerificado(await api.get<Certificado>(`certificados/verificar/${codigo.trim()}`)));
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario titulo="Emitir certificado">
        <Seletor rotulo="Aluno" opcoes={alunos.map((u) => ({ valor: u.id, texto: u.nomeCompleto }))} valor={idUsuario} aoMudar={setIdUsuario} />
        <Seletor rotulo="Curso" opcoes={cursos.map((c) => ({ valor: c.id, texto: c.titulo }))} valor={idCurso} aoMudar={setIdCurso} />
        <Botao texto="EMITIR" aoTocar={emitir} />
      </CartaoFormulario>

      <CartaoFormulario titulo="Verificar certificado">
        <Campo rotulo="Código" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" placeholder="CERT-XXXXXXXX" />
        <Botao texto="VERIFICAR" tipo="contorno" aoTocar={verificar} />
        {verificado && (
          <Text style={e.texto}>
            Válido: {verificado.usuario?.nomeCompleto} concluiu "{verificado.curso?.titulo}" em {formatarData(verificado.dataEmissao)}
          </Text>
        )}
      </CartaoFormulario>

      <Text style={e.secao}>Certificados emitidos</Text>
      {certificados.length === 0 && <Vazio texto="Nenhum certificado" />}
      {certificados.map((certificado) => (
        <View key={certificado.id} style={e.cartao}>
          <Text style={e.titulo}>{certificado.codigoVerificacao}</Text>
          <Text style={e.texto}>{certificado.usuario?.nomeCompleto} · {certificado.curso?.titulo}</Text>
          <Text style={e.detalhe}>Emitido em {formatarData(certificado.dataEmissao)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
