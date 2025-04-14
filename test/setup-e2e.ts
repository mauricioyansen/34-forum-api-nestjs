import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { DomainEvents } from "@/core/events/domain-events";
import Redis from "ioredis";
import { envSchema } from "@/infra/env/env";

config({ path: ".env", override: true });
config({ path: ".env.test", override: true });

const env = envSchema.parse(process.env);

const prisma = new PrismaClient();

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
});

function generateUniqueDbURL(schemaId: string) {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

  const url = new URL(env.DATABASE_URL);

  url.searchParams.set("schema", schemaId);

  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const dbURL = generateUniqueDbURL(schemaId);

  process.env.DATABASE_URL = dbURL;

  DomainEvents.shouldRun = false;

  await redis.flushdb();

  execSync("npx prisma migrate deploy");
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);

  await prisma.$disconnect();
});
