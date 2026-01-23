import { config } from "dotenv";
import { z } from "zod";

const { parsed } = config({ quiet: true });

console.log(parsed);

const envSchema = z.object({
  YELLYFIN_SERVER: z.string(),
});

export const ENV = envSchema.parse(parsed);
