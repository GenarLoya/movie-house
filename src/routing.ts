import type { Routing } from "express-zod-api";
import { errorEndpoint } from "./modules/media";
import { uploadController } from "./modules/media/upload/upload.route";

export const routing: Routing = {
  v1: {
    error: {
      ":code": errorEndpoint,
    },
    media: {
      upload: uploadController,
    },
  },
};
