import { config } from "dotenv";

import { defineConfig, env } from "prisma/config";

import { apiEnvFilePaths } from "./src/config/env-file-paths";

config({ path: apiEnvFilePaths });

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL")
  },
  schema: "prisma/schema.prisma"
});
