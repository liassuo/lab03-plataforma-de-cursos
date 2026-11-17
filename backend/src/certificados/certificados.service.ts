import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioLogado } from '../common/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';

const usuarioSelect = {
  select: { id: true, nomeCompleto: true, email: true },
};

@Injectable()
export class CertificadosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.certificado.findMany({
      include: { usuario: usuarioSelect, curso: true, trilha: true },
    });
  }

  findByUsuario(idUsuario: number) {
    return this.prisma.certificado.findMany({
      where: { idUsuario },
      include: { curso: true },
    });
  }

  // Consulta pública pelo código de verificação impresso no certificado
  async verificar(codigo: string) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { codigoVerificacao: codigo },
      include: { usuario: usuarioSelect, curso: true },
    });
    if (!certificado) throw new NotFoundException('Certificado não encontrado');
    return { ...certificado, valido: true };
  }

  async gerar(createCertificadoDto: CreateCertificadoDto, usuario: UsuarioLogado) {
    // O ADMIN emite para qualquer aluno; o aluno só emite o próprio,
    // e só depois de concluir o curso
    const admin = usuario.tipo === 'ADMIN';
    const idUsuario = admin && createCertificadoDto.idUsuario ? createCertificadoDto.idUsuario : usuario.userId;

    if (!admin) {
      const matricula = await this.prisma.matricula.findFirst({
        where: { idUsuario, idCurso: createCertificadoDto.idCurso },
      });
      if (!matricula?.dataConclusao) {
        throw new BadRequestException('Conclua todas as aulas do curso para emitir o certificado');
      }
    }

    const jaTem = await this.prisma.certificado.findFirst({
      where: { idUsuario, idCurso: createCertificadoDto.idCurso },
    });
    if (jaTem) throw new BadRequestException('Certificado já emitido para este curso');

    return this.prisma.certificado.create({
      data: {
        idUsuario,
        idCurso: createCertificadoDto.idCurso,
        idTrilha: createCertificadoDto.idTrilha || null,
        codigoVerificacao: this.gerarCodigoVerificacao(),
      },
      include: { usuario: usuarioSelect, curso: true },
    });
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
