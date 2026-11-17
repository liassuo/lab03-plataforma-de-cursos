import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class CreateMatriculaDto {
  // Só o ADMIN informa o aluno; para os outros perfis é usado o usuário logado
  @ApiPropertyOptional({ example: 1, description: 'ID do aluno (usado apenas pelo ADMIN)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idUsuario?: number;

  @ApiProperty({ example: 1, description: 'ID do curso' })
  @Type(() => Number)
  @IsInt()
  idCurso: number;

  @ApiPropertyOptional({ example: 'PIX', description: 'PIX, Cartão de Crédito ou Boleto' })
  @IsOptional()
  @IsIn(['PIX', 'Cartão de Crédito', 'Boleto'])
  metodoPagamento?: string;
}
