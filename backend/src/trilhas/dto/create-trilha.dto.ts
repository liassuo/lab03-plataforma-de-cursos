import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrilhaDto {
  @ApiProperty({ example: 'Fullstack JavaScript', description: 'Título da trilha' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ example: 'Do front ao back', description: 'Descrição da trilha' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 1, description: 'ID da categoria' })
  @Type(() => Number)
  @IsInt()
  idCategoria: number;
}
