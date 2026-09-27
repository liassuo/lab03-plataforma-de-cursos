import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateMatriculaDto {
  @ApiProperty({ example: 1, description: 'ID do usuário (aluno)' })
  @Type(() => Number)
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do curso' })
  @Type(() => Number)
  @IsInt()
  idCurso: number;
}
