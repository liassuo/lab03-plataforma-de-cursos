import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCursoDto {
  @ApiProperty({ example: 'JavaScript do Zero', description: 'Título do curso' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ example: 'Curso completo de JS', description: 'Descrição do curso' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 3, description: 'ID do usuário instrutor' })
  @Type(() => Number)
  @IsInt()
  idInstrutor: number;

  @ApiProperty({ example: 1, description: 'ID da categoria' })
  @Type(() => Number)
  @IsInt()
  idCategoria: number;

  @ApiPropertyOptional({ example: 'Iniciante', description: 'Iniciante, Intermediário ou Avançado' })
  @IsOptional()
  @IsString()
  nivel?: string;
}
