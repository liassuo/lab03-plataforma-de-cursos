import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePagamentoDto {
  @ApiProperty({ example: 1, description: 'ID da assinatura' })
  @Type(() => Number)
  @IsInt()
  idAssinatura: number;

  @ApiPropertyOptional({ example: 'PIX', description: 'Cartão de Crédito, Boleto ou PIX' })
  @IsOptional()
  @IsString()
  metodoPagamento?: string;
}
