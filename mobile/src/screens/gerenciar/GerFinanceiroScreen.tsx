import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Assinatura, Pagamento, Plano, Usuario } from '../../types';
import { api } from '../../services/api';
import { CartaoFormulario, Vazio, Botao, Campo, Seletor, confirmarRemocao, estilosGestao as e } from '../../components/Formulario';
import { formatarData, formatarPreco, avisar, faltaPreencher, tentar } from '../../utils';

const metodos = ['Cartão de Crédito', 'Boleto', 'PIX'];

export default function GerFinanceiroScreen() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Novo plano
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');

  // Nova assinatura
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idPlano, setIdPlano] = useState<number | null>(null);
  const [metodo, setMetodo] = useState('Cartão de Crédito');

  function carregar() {
    tentar(async () => {
      setPlanos(await api.get<Plano[]>('planos'));
      setAssinaturas(await api.get<Assinatura[]>('assinaturas'));
      setPagamentos(await api.get<Pagamento[]>('pagamentos'));
      setUsuarios(await api.get<Usuario[]>('usuarios'));
    });
  }

  useEffect(carregar, []);

  function cadastrarPlano() {
    if (faltaPreencher([['Nome', nome], ['Preço', preco], ['Duração', duracao]])) return;
    tentar(async () => {
      // Aceita "29,90" ou "29.90"
      await api.post('planos', {
        nome,
        descricao,
        preco: Number(preco.replace(',', '.')),
        duracaoMeses: Number(duracao),
      });
      setNome('');
      setDescricao('');
      setPreco('');
      setDuracao('');
      avisar('Plano cadastrado');
      carregar();
    });
  }

  function removerPlano(plano: Plano) {
    confirmarRemocao(`o plano "${plano.nome}"`, () =>
      tentar(async () => {
        await api.delete(`planos/${plano.id}`);
        avisar('Plano removido');
        carregar();
      }),
    );
  }

  // Igual à web: cria a assinatura e já registra o pagamento dela (simulado)
  function assinar() {
    if (faltaPreencher([['Usuário', idUsuario], ['Plano', idPlano]])) return;
    tentar(async () => {
      const assinatura = await api.post<Assinatura>('assinaturas', { idUsuario, idPlano });
      await api.post('pagamentos', { idAssinatura: assinatura.id, metodoPagamento: metodo });
      avisar('Assinatura criada e paga');
      carregar();
    });
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={e.secao}>Planos</Text>
      <CartaoFormulario titulo="Novo plano">
        <Campo rotulo="Nome" value={nome} onChangeText={setNome} />
        <Campo rotulo="Descrição" value={descricao} onChangeText={setDescricao} />
        <Campo rotulo="Preço (R$)" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />
        <Campo rotulo="Duração (meses)" value={duracao} onChangeText={setDuracao} keyboardType="numeric" />
        <Botao texto="CADASTRAR PLANO" aoTocar={cadastrarPlano} />
      </CartaoFormulario>
      {planos.map((plano) => (
        <View key={plano.id} style={e.cartao}>
          <View style={e.linha}>
            <Text style={e.titulo}>{plano.nome}</Text>
            <Text style={e.titulo}>{formatarPreco(plano.preco)}</Text>
          </View>
          <Text style={e.detalhe}>{plano.descricao} · {plano.duracaoMeses} mês(es)</Text>
          <Botao texto="Remover" tipo="perigo" aoTocar={() => removerPlano(plano)} />
        </View>
      ))}

      <Text style={e.secao}>Assinaturas</Text>
      <CartaoFormulario titulo="Nova assinatura">
        <Seletor rotulo="Usuário" opcoes={usuarios.map((u) => ({ valor: u.id, texto: u.nomeCompleto }))} valor={idUsuario} aoMudar={setIdUsuario} />
        <Seletor
          rotulo="Plano"
          opcoes={planos.map((p) => ({ valor: p.id, texto: `${p.nome} (${formatarPreco(p.preco)})` }))}
          valor={idPlano}
          aoMudar={setIdPlano}
        />
        <Seletor rotulo="Pagamento" opcoes={metodos.map((m) => ({ valor: m, texto: m }))} valor={metodo} aoMudar={setMetodo} />
        <Botao texto="ASSINAR E PAGAR" aoTocar={assinar} />
      </CartaoFormulario>
      {assinaturas.length === 0 && <Vazio texto="Nenhuma assinatura" />}
      {assinaturas.map((assinatura) => (
        <View key={assinatura.id} style={e.cartao}>
          <Text style={e.titulo}>{assinatura.usuario?.nomeCompleto} · {assinatura.plano?.nome}</Text>
          <Text style={e.detalhe}>
            {formatarData(assinatura.dataInicio)} até {formatarData(assinatura.dataFim)} · {assinatura.status}
          </Text>
        </View>
      ))}

      <Text style={e.secao}>Pagamentos</Text>
      {pagamentos.length === 0 && <Vazio texto="Nenhum pagamento" />}
      {pagamentos.map((pagamento) => (
        <View key={pagamento.id} style={e.cartao}>
          <View style={e.linha}>
            <Text style={e.titulo}>{formatarPreco(pagamento.valorPago)}</Text>
            <Text style={e.detalhe}>{pagamento.metodoPagamento}</Text>
          </View>
          <Text style={e.detalhe}>Pago em {formatarData(pagamento.dataPagamento)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
