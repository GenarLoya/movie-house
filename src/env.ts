import { existsSync } from "node:fs";
import { config } from "dotenv";
import { z } from "zod";

const { parsed } = config({ quiet: true });

const envSchema = z.object({
  APP_PORT: z.coerce.number().min(1).max(65535),
  APP_URL: z.string(),
  DATABASE_URL: z.string(),
  FILES_PATH_ROOT: z.string().refine((path) => {
    //Ensure path exists
    return existsSync(path);
  }),
});

export const ENV = envSchema.parse(parsed);
