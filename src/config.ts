import { createConfig } from "express-zod-api";
import createHttpError from "http-errors";
import { ENV } from "./env";

export const apiConfig = createConfig({
  http: { listen: ENV.APP_PORT },
  cors: false,
  upload: /* true or options: */ {
    limits: { fileSize: 51200 }, // 50 KB
    limitError: createHttpError(413, "The file is too large"), // handled by errorHandler in config
    debug: true, // default
    safeFileNames: true,
    createParentPath: true,
  },
});
