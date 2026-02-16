import type { Routing } from "express-zod-api";
import { errorEndpoint } from "./modules/media";

export const routing: Routing = {
  v1: {
    error: {
      ":code": errorEndpoint,
    },
  },
};
