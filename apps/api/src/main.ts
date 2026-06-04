import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { configureApiApp } from "./common/api-bootstrap";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApiApp(app);

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
}

void bootstrap();
