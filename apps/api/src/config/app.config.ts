import { registerAs } from "@nestjs/config";

import { validateEnvironment } from "./env.validation";

export interface AppEnvironmentConfig {
  readonly nodeEnv: "development" | "test" | "production";
  readonly port: number;
  readonly webOrigin: string;
  readonly databaseUrl: string;
}

export const appConfig = registerAs(
  "app",
  (): AppEnvironmentConfig => {
    const env = validateEnvironment(process.env);

    return {
      databaseUrl: env.DATABASE_URL,
      nodeEnv: env.NODE_ENV,
      port: env.API_PORT,
      webOrigin: env.WEB_ORIGIN
    };
  }
);
