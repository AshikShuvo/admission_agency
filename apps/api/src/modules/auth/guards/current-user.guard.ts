import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { AuthenticatedRequest, AuthenticatedUser } from "../types/authenticated-user";
import { UserRole, userRoles } from "../policies/permission.types";

const USER_ID_HEADER = "x-user-id";
const USER_EMAIL_HEADER = "x-user-email";
const USER_ROLE_HEADER = "x-user-role";

@Injectable()
export class CurrentUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = this.extractUser(request);
    return true;
  }

  private extractUser(request: AuthenticatedRequest): AuthenticatedUser {
    const id = this.requiredHeader(request, USER_ID_HEADER);
    const email = this.requiredHeader(request, USER_EMAIL_HEADER);
    const role = this.parseRole(this.requiredHeader(request, USER_ROLE_HEADER));

    return {
      email,
      id,
      role
    };
  }

  private requiredHeader(request: AuthenticatedRequest, headerName: string): string {
    const value = request.header(headerName);

    if (!value) {
      throw new UnauthorizedException(`Missing ${headerName} header`);
    }

    return value;
  }

  private parseRole(value: string): UserRole {
    const normalized = value.trim().toUpperCase();
    const role = userRoles.find((candidate) => candidate === normalized);

    if (!role) {
      throw new UnauthorizedException("Invalid user role");
    }

    return role;
  }
}
