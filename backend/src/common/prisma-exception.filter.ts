import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

// Converte os erros conhecidos do Prisma em respostas HTTP com mensagem clara,
// em vez de devolver um erro 500
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(erro: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse<Response>();
    const metodo = host.switchToHttp().getRequest<Request>().method;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = `Erro no banco de dados (${erro.code})`;

    if (erro.code === 'P2002') {
      // campo único repetido (ex: email já cadastrado)
      status = HttpStatus.CONFLICT;
      message = 'Já existe um registro com esses dados';
    } else if (erro.code === 'P2003') {
      // chave estrangeira: no DELETE o registro tem dependentes,
      // no POST/PUT o id informado aponta para um registro que não existe
      status = HttpStatus.CONFLICT;
      message =
        metodo === 'DELETE'
          ? 'Operação não permitida: existem registros vinculados'
          : 'Registro relacionado não encontrado (verifique os ids informados)';
    } else if (erro.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Registro não encontrado';
    }

    resposta.status(status).json({ statusCode: status, message });
  }
}
