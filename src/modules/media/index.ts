import { defaultEndpointsFactory } from "express-zod-api";
import createHttpError from "http-errors";
import { z } from "zod";

export const errorEndpoint = defaultEndpointsFactory.build({
  input: z.object({
    code: z.coerce.number(),
  }),
  output: z.object({
    greetings: z.string(),
  }),
  handler: async ({ input: { code } }) => {
    throw createHttpError(code);
  },
});
