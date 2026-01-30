import { config } from "dotenv";
import { z } from "zod";

const { parsed } = config({ quiet: true });

const envSchema = z.object({
  APP_PORT: z.coerce.number().min(1).max(65535),
  APP_URL: z.string(),
  DATABASE_URL: z.string(),
});

export const ENV = envSchema.parse(parsed);
