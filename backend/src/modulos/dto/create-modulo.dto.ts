import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateModuloDto {
  @ApiProperty({ example: 1, description: 'ID do curso' })
  @Type(() => Number)
  @IsInt()
  idCurso: number;

  @ApiProperty({ example: 'Introdução', description: 'Título do módulo' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ example: 1, description: 'Ordem do módulo no curso (automática se omitida)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ordem?: number;
}
