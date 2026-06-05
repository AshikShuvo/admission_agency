import { Body, Controller, Module, Post } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsInt, IsString, Min } from "class-validator";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/admission_agency_test";
});

import { AppModule } from "../src/app.module";
import { configureApiApp } from "../src/common/api-bootstrap";
import { apiEnvFilePaths } from "../src/config/env-file-paths";
import { validateEnvironment } from "../src/config/env.validation";
import { PrismaService } from "../src/modules/prisma/prisma.service";

const testWebOrigin = "http://localhost:3000";

const prismaServiceMock = {
  $connect: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  $disconnect: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  onModuleDestroy: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  onModuleInit: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
};

const authHeaders = {
  accounts: {
    "x-user-email": "accounts@example.com",
    "x-user-id": "user_accounts_1",
    "x-user-role": "ACCOUNTS"
  },
  admission: {
    "x-user-email": "admission@example.com",
    "x-user-id": "user_admission_1",
    "x-user-role": "ADMISSION"
  },
  consultant: {
    "x-user-email": "consultant@example.com",
    "x-user-id": "user_consultant_1",
    "x-user-role": "CONSULTANT"
  },
  owner: {
    "x-user-email": "owner@example.com",
    "x-user-id": "user_owner_1",
    "x-user-role": "OWNER"
  }
} as const;

class BoundaryValidationDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name!: string;

  @IsInt()
  @Min(1)
  count!: number;
}

@Controller("validation-test")
class BoundaryValidationController {
  @Post()
  create(@Body() dto: BoundaryValidationDto): BoundaryValidationDto {
    return dto;
  }
}

@Module({
  controllers: [BoundaryValidationController]
})
class BoundaryValidationModule {}

describe("App health", () => {
  let app: INestApplication | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/admission_agency_test";
  });

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("returns API health status", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer()).get("/health").expect(200).expect({
      ok: true,
      service: "admission-agency-api"
    });
  });

  it("serves the OpenAPI document", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer())
      .get("/docs-json")
      .expect(200)
      .expect(({ body }) => {
        expect(body.info.title).toBe("Admission Agency API");
        expect(body.openapi).toMatch(/^3\./);
      });
  });

  it("returns current user permissions and workspace visibility", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer())
      .get("/auth/me")
      .set(authHeaders.accounts)
      .expect(200)
      .expect(({ body }) => {
        expect(body.user).toEqual({
          email: "accounts@example.com",
          id: "user_accounts_1",
          role: "ACCOUNTS"
        });
        expect(body.permissions).toContainEqual({ action: "confirm", resource: "payments", scope: "financial" });
        expect(body.permissions).not.toContainEqual({ action: "manage", resource: "users", scope: "all" });
        expect(body.workspaces).toContainEqual({ allowed: true, id: "payments", label: "Payments" });
        expect(body.workspaces).toContainEqual({ allowed: false, id: "users", label: "Users" });
      });
  });

  it("allows Owner to run owner-only protected actions", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer()).post("/auth/checks/users/manage").set(authHeaders.owner).expect(201).expect({
      ok: true
    });

    await request(app.getHttpServer()).post("/auth/checks/commissions/manage").set(authHeaders.owner).expect(201).expect({
      ok: true
    });
  });

  it("blocks non-owner users from managing catalog, users, and commissions", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer()).post("/auth/checks/catalog/manage").set(authHeaders.consultant).expect(403);
    await request(app.getHttpServer()).post("/auth/checks/users/manage").set(authHeaders.admission).expect(403);
    await request(app.getHttpServer()).post("/auth/checks/commissions/manage").set(authHeaders.accounts).expect(403);
  });

  it("blocks Accounts from approving admission and visa stages", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer()).post("/auth/checks/admission/approve").set(authHeaders.accounts).expect(403);
    await request(app.getHttpServer()).post("/auth/checks/visa/approve").set(authHeaders.accounts).expect(403);
  });

  it("normalizes and transforms DTO input at the API boundary", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BoundaryValidationModule]
    }).compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer())
      .post("/validation-test")
      .send({ count: "2", name: "  Intake  " })
      .expect(201)
      .expect({
        count: 2,
        name: "Intake"
      });
  });

  it("rejects unknown DTO properties", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BoundaryValidationModule]
    }).compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpServer())
      .post("/validation-test")
      .send({ count: "2", name: "Intake", unexpected: true })
      .expect(400);
  });

  it("validates PostgreSQL database configuration", () => {
    expect(
      validateEnvironment({
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/admission_agency",
        NODE_ENV: "test"
      })
    ).toEqual({
      API_PORT: 4000,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/admission_agency",
      NODE_ENV: "test",
      WEB_ORIGIN: testWebOrigin
    });
  });

  it("rejects non-PostgreSQL database URLs", () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: "mysql://root:root@localhost:3306/admission_agency",
        NODE_ENV: "test"
      })
    ).toThrow("DATABASE_URL must be a PostgreSQL connection string");
  });

  it("loads API env before the root monorepo env file", () => {
    expect(apiEnvFilePaths[0]).toMatch(/apps\/api\/\.env$/);
    expect(apiEnvFilePaths[1]).toMatch(/\.env$/);
  });
});
