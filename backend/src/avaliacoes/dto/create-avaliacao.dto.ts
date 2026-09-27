import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAvaliacaoDto {
  @ApiProperty({ example: 1, description: 'ID do usuário (aluno)' })
  @Type(() => Number)
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do curso' })
  @Type(() => Number)
  @IsInt()
  idCurso: number;

  @ApiProperty({ example: 5, description: 'Nota de 1 a 5' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @ApiPropertyOptional({ example: 'Curso muito bom!', description: 'Comentário opcional' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
