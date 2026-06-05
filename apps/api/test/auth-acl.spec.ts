import { Controller, HttpCode, Module, Post, UseGuards } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { AuthModule } from "../src/modules/auth/auth.module";
import { RequirePermissions } from "../src/modules/auth/decorators/require-permissions.decorator";
import { CurrentUserGuard } from "../src/modules/auth/guards/current-user.guard";
import { PermissionsGuard } from "../src/modules/auth/guards/permissions.guard";
import { UserRole } from "../src/modules/auth/policies/permission.types";
import { PermissionsService } from "../src/modules/auth/policies/permissions.service";

type TestUserHeaders = Record<string, string>;

function headersFor(role: UserRole): TestUserHeaders {
  return {
    "x-user-email": `${role.toLowerCase()}@example.com`,
    "x-user-id": `user_${role.toLowerCase()}_1`,
    "x-user-role": role
  };
}

@Controller("acl-test")
@UseGuards(CurrentUserGuard, PermissionsGuard)
class AclPolicyTestController {
  @Post("catalog/manage")
  @HttpCode(204)
  @RequirePermissions({ action: "manage", resource: "catalog" })
  manageCatalog(): void {}

  @Post("users/manage")
  @HttpCode(204)
  @RequirePermissions({ action: "manage", resource: "users" })
  manageUsers(): void {}

  @Post("commissions/manage")
  @HttpCode(204)
  @RequirePermissions({ action: "manage", resource: "commissions" })
  manageCommissions(): void {}

  @Post("payments/confirm")
  @HttpCode(204)
  @RequirePermissions({ action: "confirm", resource: "payments" })
  confirmPayment(): void {}

  @Post("admission/approve")
  @HttpCode(204)
  @RequirePermissions({ action: "approve", resource: "admission" })
  approveAdmission(): void {}

  @Post("visa/approve")
  @HttpCode(204)
  @RequirePermissions({ action: "approve", resource: "visa" })
  approveVisa(): void {}
}

@Module({
  controllers: [AclPolicyTestController],
  imports: [AuthModule]
})
class AclPolicyTestModule {}

describe("Auth ACL role permissions", () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function createAclPolicyApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [AclPolicyTestModule]
    }).compile();

    const nestApp = moduleRef.createNestApplication();
    await nestApp.init();
    return nestApp;
  }

  it("exposes current user permissions from GET /auth/me", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get("/auth/me")
      .set(headersFor(UserRole.OWNER))
      .expect(200)
      .expect(({ body }) => {
        expect(body.user).toEqual({
          email: "owner@example.com",
          id: "user_owner_1",
          role: UserRole.OWNER
        });
        expect(body.permissions).toContainEqual({
          action: "manage",
          resource: "catalog",
          scope: "all"
        });
        expect(body.permissions).toContainEqual({
          action: "manage",
          resource: "commissions",
          scope: "all"
        });
      });
  });

  it("keeps owner-only management permissions out of non-owner role maps", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule]
    }).compile();

    const permissionsService = moduleRef.get(PermissionsService);
    const ownerOnlyRequirements = [
      { action: "manage", resource: "catalog" },
      { action: "manage", resource: "users" },
      { action: "manage", resource: "commissions" }
    ] as const;
    const nonOwnerRoles = [UserRole.CONSULTANT, UserRole.ACCOUNTS, UserRole.ADMISSION, UserRole.VISA] as const;

    for (const requirement of ownerOnlyRequirements) {
      expect(permissionsService.can(UserRole.OWNER, requirement)).toBe(true);

      for (const role of nonOwnerRoles) {
        expect(permissionsService.can(role, requirement)).toBe(false);
      }
    }
  });

  it("allows owner management routes and blocks non-owner direct access", async () => {
    app = await createAclPolicyApp();

    await request(app.getHttpServer())
      .post("/acl-test/catalog/manage")
      .set(headersFor(UserRole.OWNER))
      .expect(204);

    await request(app.getHttpServer())
      .post("/acl-test/users/manage")
      .set(headersFor(UserRole.CONSULTANT))
      .expect(403);

    await request(app.getHttpServer())
      .post("/acl-test/commissions/manage")
      .set(headersFor(UserRole.ADMISSION))
      .expect(403);
  });

  it("allows department-owned actions and blocks accounts from admission or visa approvals", async () => {
    app = await createAclPolicyApp();

    await request(app.getHttpServer())
      .post("/acl-test/payments/confirm")
      .set(headersFor(UserRole.ACCOUNTS))
      .expect(204);

    await request(app.getHttpServer())
      .post("/acl-test/admission/approve")
      .set(headersFor(UserRole.ACCOUNTS))
      .expect(403);

    await request(app.getHttpServer())
      .post("/acl-test/visa/approve")
      .set(headersFor(UserRole.ACCOUNTS))
      .expect(403);

    await request(app.getHttpServer())
      .post("/acl-test/admission/approve")
      .set(headersFor(UserRole.ADMISSION))
      .expect(204);

    await request(app.getHttpServer())
      .post("/acl-test/visa/approve")
      .set(headersFor(UserRole.VISA))
      .expect(204);
  });

  it("rejects protected routes without current user context", async () => {
    app = await createAclPolicyApp();

    await request(app.getHttpServer()).post("/acl-test/catalog/manage").expect(401);
  });
});
