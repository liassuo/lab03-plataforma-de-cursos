import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  // O cadastro público sempre cria ALUNO; só o ADMIN muda o perfil pela edição
  @ApiPropertyOptional({ example: 'AUTOR', description: 'ALUNO, AUTOR ou ADMIN' })
  @IsOptional()
  @IsIn(['ALUNO', 'AUTOR', 'ADMIN'])
  tipo?: string;
}
