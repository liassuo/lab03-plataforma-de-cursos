import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TipoUsuario } from './roles.decorator';

// Deve ser usado depois do AuthGuard('jwt'), que coloca o usuário em req.user
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const tipos = this.reflector.get<TipoUsuario[]>('roles', context.getHandler());

    // Rota sem @Roles: basta estar logado
    if (!tipos) return true;

    const usuario = context.switchToHttp().getRequest().user;
    if (!tipos.includes(usuario.tipo)) {
      throw new ForbiddenException('Seu perfil não tem permissão para esta ação');
    }
    return true;
  }
}
