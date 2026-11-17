import { SetMetadata } from '@nestjs/common';

// Perfis de usuário do sistema
export type TipoUsuario = 'ALUNO' | 'AUTOR' | 'ADMIN';

// Dados do usuário logado que o JwtStrategy coloca em req.user
export interface UsuarioLogado {
  userId: number;
  email: string;
  tipo: TipoUsuario;
}

// Marca a rota com os perfis que podem acessá-la. Ex: @Roles('ADMIN')
export const Roles = (...tipos: TipoUsuario[]) => SetMetadata('roles', tipos);
