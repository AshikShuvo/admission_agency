import { Injectable } from "@nestjs/common";

import { CurrentUserResponseDto } from "./dto/current-user-response.dto";
import { PermissionsService } from "./policies/permissions.service";
import { AuthenticatedUser } from "./types/authenticated-user";

@Injectable()
export class AuthService {
  constructor(private readonly permissionsService: PermissionsService) {}

  getCurrentUser(user: AuthenticatedUser): CurrentUserResponseDto {
    return new CurrentUserResponseDto(
      user,
      this.permissionsService.getPermissionsForRole(user.role),
      this.permissionsService.getWorkspacesForRole(user.role)
    );
  }
}
