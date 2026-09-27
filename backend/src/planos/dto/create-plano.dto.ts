import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanoDto {
  @ApiProperty({ example: 'Premium', description: 'Nome do plano' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'Acesso ilimitado', description: 'Descrição do plano' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 99.9, description: 'Preço do plano em reais' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiProperty({ example: 12, description: 'Duração do plano em meses' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duracaoMeses: number;
}
