import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do usuário (único)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha com no mínimo 4 caracteres', minLength: 4 })
  @IsString()
  @MinLength(4)
  senha: string;
}
