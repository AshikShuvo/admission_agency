import { resolve } from "node:path";

export const apiEnvFilePaths: string[] = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")];
