import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../users/entities/user.entity";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // More flexible role check - convert to lowercase strings for comparison
    return requiredRoles.some((role) => {
      // Handle case where user.role could be either a string or an enum
      const userRoleStr = typeof user.role === 'string' ? user.role.toLowerCase() : String(user.role).toLowerCase();
      const requiredRoleStr = typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase();
      return userRoleStr === requiredRoleStr;
    });
  }
}
