import pino from "pino";

const transport = process.stdout.isTTY
  ? { transport: { target: "pino-pretty" } }
  : {};

export const logger = pino({
  ...transport,
});
