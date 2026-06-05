import { ApiProperty } from "@nestjs/swagger";

import { DataScope, PermissionAction, PermissionResource, UserRole } from "../policies/permission.types";
import { PermissionDefinition } from "../policies/permission.types";
import { WorkspaceAccess } from "../policies/permissions.service";
import { AuthenticatedUser } from "../types/authenticated-user";

export class AuthenticatedUserDto implements AuthenticatedUser {
  @ApiProperty({ example: "user_owner_1" })
  readonly id: string;

  @ApiProperty({ example: "owner@example.com" })
  readonly email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.OWNER })
  readonly role: UserRole;

  constructor(user: AuthenticatedUser) {
    this.email = user.email;
    this.id = user.id;
    this.role = user.role;
  }
}

export class PermissionDto implements PermissionDefinition {
  @ApiProperty({ example: "catalog" })
  readonly resource: PermissionResource;

  @ApiProperty({ example: "manage" })
  readonly action: PermissionAction;

  @ApiProperty({ example: "all" })
  readonly scope: DataScope;

  constructor(permission: PermissionDefinition) {
    this.action = permission.action;
    this.resource = permission.resource;
    this.scope = permission.scope;
  }
}

export class CurrentUserResponseDto {
  @ApiProperty({ type: AuthenticatedUserDto })
  readonly user: AuthenticatedUserDto;

  @ApiProperty({ type: PermissionDto, isArray: true })
  readonly permissions: readonly PermissionDto[];

  @ApiProperty({
    example: [
      { allowed: true, id: "files", label: "Files" },
      { allowed: false, id: "users", label: "Users" }
    ],
    isArray: true
  })
  readonly workspaces: readonly WorkspaceAccess[];

  constructor(
    user: AuthenticatedUser,
    permissions: readonly PermissionDefinition[],
    workspaces: readonly WorkspaceAccess[]
  ) {
    this.permissions = permissions.map((permission) => new PermissionDto(permission));
    this.user = new AuthenticatedUserDto(user);
    this.workspaces = workspaces;
  }
}
