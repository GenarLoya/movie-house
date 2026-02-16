import { createConfig } from "express-zod-api";
import { ENV } from "./env";

export const apiConfig = createConfig({
  http: { listen: ENV.APP_PORT },
  cors: false,
});
