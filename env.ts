import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .refine(
      (port) => parseInt(port) > 0 && parseInt(port) < 65536,
      "Invalid port number"
    ),
  GRAPH_API_TOKEN: z.string(),
  BUSINESS_NUMBER_ID: z.string(),
  BUSINESS_PHONE_NUMBER_ID: z.string(),
  WEBHOOK_APP_SECRET: z.string(),
  WEBHOOK_VERIFY_TOKEN: z.string(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string(),
  DATABASE_URL: z.string(),
});

type env = z.infer<typeof envSchema>;

export const env: env = envSchema.parse(process.env);
