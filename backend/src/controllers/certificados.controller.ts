import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { store } from '../store';

@Controller('api/certificados')
export class CertificadosController {
  @Get()
  listar() {
    return store.certificados.map(c => ({
      ...c,
      usuario: store.usuarios.find(u => u.id === c.idUsuario),
      curso: store.cursos.find(cur => cur.id === c.idCurso),
      trilha: c.idTrilha ? store.trilhas.find(t => t.id === c.idTrilha) : null,
    }));
  }

  @Get('verificar/:codigo')
  verificar(@Param('codigo') codigo: string) {
    const cert = store.certificados.find(c => c.codigoVerificacao === codigo);
    if (!cert) throw new HttpException('Certificado não encontrado', HttpStatus.NOT_FOUND);
    return {
      ...cert,
      usuario: store.usuarios.find(u => u.id === cert.idUsuario),
      curso: store.cursos.find(c => c.id === cert.idCurso),
      valido: true,
    };
  }

  @Post()
  gerar(@Body() dados: any) {
    const jaTemCertificado = store.certificados.find(
      c => c.idUsuario === +dados.idUsuario && c.idCurso === +dados.idCurso
    );
    if (jaTemCertificado) throw new HttpException('Certificado já emitido para este curso', HttpStatus.BAD_REQUEST);

    const codigo = this.gerarCodigoVerificacao();
    const novo = {
      id: store.proximoId('certificados'),
      idUsuario: +dados.idUsuario,
      idCurso: +dados.idCurso,
      idTrilha: dados.idTrilha ? +dados.idTrilha : null,
      codigoVerificacao: codigo,
      dataEmissao: new Date().toISOString().split('T')[0],
    };
    store.certificados.push(novo);

    return {
      ...novo,
      usuario: store.usuarios.find(u => u.id === novo.idUsuario),
      curso: store.cursos.find(c => c.id === novo.idCurso),
    };
  }

  private gerarCodigoVerificacao(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'CERT-';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  }
}
