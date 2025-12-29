import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_LEMON_API_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_LEMON_API_BASE_URL must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function getEnv(): Env | null {
  if (env) return env;

  try {
    env = envSchema.parse({
      NEXT_PUBLIC_LEMON_API_BASE_URL:
        process.env.NEXT_PUBLIC_LEMON_API_BASE_URL,
    });
    return env;
  } catch (error) {
    console.error("Environment validation failed:", error);
    return null;
  }
}

export function requireEnv(): Env {
  const validatedEnv = getEnv();
  if (!validatedEnv) {
    throw new Error(
      "Required environment variables are not set. Please check your .env.local file."
    );
  }
  return validatedEnv;
}
