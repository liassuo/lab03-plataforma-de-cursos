import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateCertificadoDto {
  @ApiProperty({ example: 1, description: 'ID do usuário (aluno)' })
  @Type(() => Number)
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do curso concluído' })
  @Type(() => Number)
  @IsInt()
  idCurso: number;

  @ApiPropertyOptional({ example: 1, description: 'ID da trilha (opcional)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idTrilha?: number;
}
