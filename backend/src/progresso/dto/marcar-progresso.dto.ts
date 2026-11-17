import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class MarcarProgressoDto {
  // Só o ADMIN informa o aluno; para os outros perfis é usado o usuário logado
  @ApiPropertyOptional({ example: 1, description: 'ID do aluno (usado apenas pelo ADMIN)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idUsuario?: number;

  @ApiProperty({ example: 1, description: 'ID da aula' })
  @Type(() => Number)
  @IsInt()
  idAula: number;

  @ApiPropertyOptional({ example: 'Concluido', description: 'Status da aula (padrão: Concluido)' })
  @IsOptional()
  @IsString()
  status?: string;
}
