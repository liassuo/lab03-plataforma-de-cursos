import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAulaDto {
  @ApiProperty({ example: 1, description: 'ID do módulo' })
  @Type(() => Number)
  @IsInt()
  idModulo: number;

  @ApiProperty({ example: 'Variáveis e tipos', description: 'Título da aula' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ example: 'Video', description: 'Video, Texto ou Quiz' })
  @IsOptional()
  @IsString()
  tipoConteudo?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/...', description: 'URL do conteúdo' })
  @IsOptional()
  @IsString()
  urlConteudo?: string;

  @ApiProperty({ example: 15, description: 'Duração da aula em minutos' })
  @Type(() => Number)
  @IsInt()
  duracaoMinutos: number;

  @ApiPropertyOptional({ example: 1, description: 'Ordem da aula no módulo (automática se omitida)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ordem?: number;
}
