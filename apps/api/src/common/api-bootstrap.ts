import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function configureApiApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000"
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      validateCustomDecorators: true,
      whitelist: true
    })
  );

  configureSwagger(app);
}

function configureSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Admission Agency API")
    .setDescription("Backend API for admission agency operations.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    jsonDocumentUrl: "docs-json"
  });
}
