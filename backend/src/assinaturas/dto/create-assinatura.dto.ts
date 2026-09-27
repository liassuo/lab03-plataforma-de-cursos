import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateAssinaturaDto {
  @ApiProperty({ example: 1, description: 'ID do usuário' })
  @Type(() => Number)
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do plano escolhido' })
  @Type(() => Number)
  @IsInt()
  idPlano: number;
}
