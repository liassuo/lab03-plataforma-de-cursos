import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCursoDto {
  @ApiProperty({ example: 'JavaScript do Zero', description: 'Título do curso' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ example: 'Curso completo de JS', description: 'Descrição do curso' })
  @IsOptional()
  @IsString()
  descricao?: string;

  // O AUTOR não precisa informar: ele sempre fica como instrutor do próprio curso
  @ApiPropertyOptional({ example: 3, description: 'ID do instrutor (usado apenas pelo ADMIN)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idInstrutor?: number;

  @ApiProperty({ example: 1, description: 'ID da categoria' })
  @Type(() => Number)
  @IsInt()
  idCategoria: number;

  @ApiPropertyOptional({ example: 'Iniciante', description: 'Iniciante, Intermediário ou Avançado' })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiPropertyOptional({ example: 49.9, description: 'Preço do curso (0 para gratuito)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco?: number;
}
