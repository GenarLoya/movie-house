import { createServer } from "express-zod-api";
import { apiConfig } from "./config";
import { routing } from "./routing";

createServer(apiConfig, routing);
