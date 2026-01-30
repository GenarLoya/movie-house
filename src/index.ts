import express from "express";
import { prisma } from "./db/prisma";
import { ENV } from "./env";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());

app.get("/", async (_req, res) => {
  const data = await prisma.movie.findMany();

  return res.json(data);
});

app.listen(ENV.APP_PORT, () => {
  logger.info({ port: ENV.APP_PORT, url: ENV.APP_URL }, "Server started");
});
