import { Body, Controller, Module, Post } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsInt, IsString, Min } from "class-validator";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";
import { configureApiApp } from "../src/common/api-bootstrap";

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

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("returns API health status", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app);
    await app.init();

    await request(app.getHttpServer()).get("/health").expect(200).expect({
      ok: true,
      service: "admission-agency-api"
    });
  });

  it("serves the OpenAPI document", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    configureApiApp(app);
    await app.init();

    await request(app.getHttpServer())
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
    configureApiApp(app);
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
    configureApiApp(app);
    await app.init();

    await request(app.getHttpServer())
      .post("/validation-test")
      .send({ count: "2", name: "Intake", unexpected: true })
      .expect(400);
  });
});
