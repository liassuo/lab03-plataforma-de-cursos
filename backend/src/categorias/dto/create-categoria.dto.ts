import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Desenvolvimento Web', description: 'Nome da categoria (único)' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'Cursos de programação web', description: 'Descrição da categoria' })
  @IsOptional()
  @IsString()
  descricao?: string;
}
