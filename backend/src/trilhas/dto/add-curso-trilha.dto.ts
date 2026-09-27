import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class AddCursoTrilhaDto {
  @ApiProperty({ example: 1, description: 'ID do curso a adicionar na trilha' })
  @Type(() => Number)
  @IsInt()
  idCurso: number;

  @ApiPropertyOptional({ example: 1, description: 'Ordem do curso na trilha (automática se omitida)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ordem?: number;
}
