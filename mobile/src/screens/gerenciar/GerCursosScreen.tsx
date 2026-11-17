import { ComponentRef, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Categoria, Curso, Usuario } from '../../types';
import { api, obterUsuario } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Campo, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { avisar, faltaPreencher, formatarData, tentar } from '../../utils';

const niveis = ['Iniciante', 'Intermediário', 'Avançado'];

export default function GerCursosScreen() {
  const usuario = obterUsuario();
  const autor = usuario.tipo === 'AUTOR';

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [instrutores, setInstrutores] = useState<Usuario[]>([]);

  // Campos do formulário. editandoId = null quer dizer "novo curso"
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [nivel, setNivel] = useState('Iniciante');
  const [preco, setPreco] = useState('');
  const [idInstrutor, setIdInstrutor] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  // Usado para rolar até o formulário (que fica no topo) ao tocar em "Editar"
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);

  function carregar() {
    tentar(async () => {
      const lista = await api.get<Curso[]>('cursos');
      // O autor vê só os próprios cursos
      setCursos(autor ? lista.filter((c) => c.idInstrutor === usuario.id) : lista);
      setCategorias(await api.get<Categoria[]>('categorias'));
      if (!autor) {
        const usuarios = await api.get<Usuario[]>('usuarios');
        setInstrutores(usuarios.filter((u) => u.tipo !== 'ALUNO'));
      }
    });
  }

  useEffect(carregar, []);

  function limpar() {
    setEditandoId(null);
    setTitulo('');
    setDescricao('');
    setIdCategoria(null);
    setNivel('Iniciante');
    setPreco('');
    setIdInstrutor(null);
    setFormAberto(false);
  }

  function editar(curso: Curso) {
    setEditandoId(curso.id);
    setTitulo(curso.titulo);
    setDescricao(curso.descricao ?? '');
    setIdCategoria(curso.idCategoria);
    setNivel(curso.nivel);
    setPreco(String(curso.preco ?? 0));
    setIdInstrutor(curso.idInstrutor);
    setFormAberto(true);
    rolagem.current?.scrollTo({ y: 0, animated: true });
  }

  function salvar() {
    if (faltaPreencher([['Título', titulo], ['Categoria', idCategoria]])) return;
    tentar(async () => {
      // O autor não manda o instrutor: o backend usa ele mesmo
      // Aceita vírgula ou ponto no preço (ex: 49,90)
      const valor = Number(preco.replace(',', '.')) || 0;
      const dados = { titulo, descricao, idCategoria, nivel, preco: valor, idInstrutor: autor ? undefined : idInstrutor ?? undefined };
      if (editandoId) {
        await api.put(`cursos/${editandoId}`, dados); // avisa os alunos matriculados (Kafka)
        avisar('Curso atualizado');
      } else {
        await api.post('cursos', dados);
        avisar('Curso cadastrado');
      }
      limpar();
      carregar();
    });
  }

  function remover(curso: Curso) {
    confirmarRemocao(`o curso "${curso.titulo}"`, () =>
      tentar(async () => {
        await api.delete(`cursos/${curso.id}`);
        avisar('Curso removido');
        carregar();
      }),
    );
  }

  return (
    <ScrollView ref={rolagem} style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <CartaoFormulario
        titulo={editandoId ? 'Editar curso' : 'Novo curso'}
        aberto={formAberto}
        aoAlternar={() => (formAberto ? limpar() : setFormAberto(true))}
      >
        <Campo rotulo="Título" value={titulo} onChangeText={setTitulo} />
        <Campo rotulo="Descrição" value={descricao} onChangeText={setDescricao} multiline />
        <Seletor
          rotulo="Categoria"
          opcoes={categorias.map((c) => ({ valor: c.id, texto: c.nome }))}
          valor={idCategoria}
          aoMudar={setIdCategoria}
        />
        <Seletor rotulo="Nível" opcoes={niveis.map((n) => ({ valor: n, texto: n }))} valor={nivel} aoMudar={setNivel} />
        <Campo rotulo="Preço (R$)" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" placeholder="0 para gratuito" />
        {!autor && (
          <Seletor
            rotulo="Instrutor"
            opcoes={instrutores.map((u) => ({ valor: u.id, texto: u.nomeCompleto }))}
            valor={idInstrutor}
            aoMudar={setIdInstrutor}
          />
        )}
        <Botao texto={editandoId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR CURSO'} aoTocar={salvar} />
        {editandoId && <Botao texto="Cancelar edição" tipo="contorno" aoTocar={limpar} />}
      </CartaoFormulario>

      <Text style={e.secao}>{autor ? 'Meus cursos' : 'Todos os cursos'}</Text>
      {cursos.length === 0 && <Vazio texto="Nenhum curso cadastrado" />}

      {cursos.map((curso) => (
        <View key={curso.id} style={e.cartao}>
          <Text style={e.titulo}>{curso.titulo}</Text>
          <Text style={e.detalhe}>
            {curso.categoria?.nome} · {curso.nivel} · {curso.instrutor?.nomeCompleto}
          </Text>
          <Text style={e.detalhe}>
            {curso.totalAulas} aula(s) · {curso.totalHoras}h · atualizado em {formatarData(curso.dataAtualizacao)}
          </Text>
          <View style={e.botoesLinha}>
            <Botao texto="Editar" tipo="contorno" aoTocar={() => editar(curso)} />
            <Botao texto="Remover" tipo="perigo" aoTocar={() => remover(curso)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
