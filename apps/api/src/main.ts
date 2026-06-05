import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { configureApiApp } from "./common/api-bootstrap";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("app.port");
  const webOrigin = configService.getOrThrow<string>("app.webOrigin");

  configureApiApp(app, { webOrigin });

  await app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
}

void bootstrap();
