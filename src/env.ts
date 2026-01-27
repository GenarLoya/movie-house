import { config } from "dotenv";
import { z } from "zod";

const { parsed } = config({ quiet: true });

const envSchema = z.object({
  DATABASE_URL: z.string(),
});

export const ENV = envSchema.parse(parsed);
