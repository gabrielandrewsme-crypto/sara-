import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  MOCK_BACKEND: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  AUTH_SESSION_DAYS: z.coerce.number().int().positive().default(14),
  AUTH_CODE_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  AUTH_COOKIE_NAME: z.string().default("sara_session"),
  CAKTO_WEBHOOK_SECRET: z.string().optional(),
  CAKTO_PRODUCT_ID: z.string().optional(),
  CAKTO_CHECKOUT_URL: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  TRANSCRIPTION_API_URL: z.string().optional(),
  TRANSCRIPTION_API_KEY: z.string().optional(),
  IA_API_URL: z.string().optional(),
  IA_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("acesso@sara.app"),
  EMAIL_PROVIDER: z.enum(["console", "http"]).default("console"),
  EMAIL_PROVIDER_URL: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;

const hasRealDatabaseUrl =
  Boolean(env.DATABASE_URL) &&
  !env.DATABASE_URL?.includes("SEU_VALOR_REAL_DA_NEON");

export const isMockBackend = env.MOCK_BACKEND || !hasRealDatabaseUrl;
