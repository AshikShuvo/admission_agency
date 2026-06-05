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

    await request(app.getHttpAdapter().getInstance()).get("/health").expect(200).expect({
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

    await request(app.getHttpAdapter().getInstance())
      .get("/docs-json")
      .expect(200)
      .expect(({ body }) => {
        expect(body.info.title).toBe("Admission Agency API");
        expect(body.openapi).toMatch(/^3\./);
      });
  });

  it("normalizes and transforms DTO input at the API boundary", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BoundaryValidationModule]
    }).compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app, { webOrigin: testWebOrigin });
    await app.init();

    await request(app.getHttpAdapter().getInstance())
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

    await request(app.getHttpAdapter().getInstance())
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
