import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { defaultEndpointsFactory, ez } from "express-zod-api";
import { v4 } from "uuid";
import { z } from "zod";
import { ENV } from "../../../env";

export const uploadController = defaultEndpointsFactory.build({
  method: "post",
  input: z.object({
    video: ez.upload(),
  }),
  output: z.object({
    siuu: z.string(),
  }),
  handler: async ({ input: { video } }) => {
    const uuid = v4();
    const targetDir = join(ENV.FILES_PATH_ROOT, uuid);
    const targetPath = join(targetDir, video.name);

    // Create directory first
    await mkdir(targetDir, { recursive: true });

    // Move file to target location
    await video.mv(targetPath);

    return {
      siuu: "HH",
    };
  },
});
