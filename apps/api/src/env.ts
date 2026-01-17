import { v } from "azurajs/validators";
import "dotenv/config";

const envSchema = v.object({
  POSTGRE_DATABASE_URL: v.string(),
  REDIS_DATABASE_URL: v.string(),
  PORT: v.string(),
  NODE_ENV: v.string(),
  APP_URL: v.string().optional(),
});

export const env = envSchema.parse(process.env);
