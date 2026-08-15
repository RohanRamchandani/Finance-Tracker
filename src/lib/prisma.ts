import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 uses driver adapters: the client talks to Postgres through `pg`.
// We lazily construct a single client and reuse it. Lazy construction matters
// because `next build` imports server modules to analyze them — we don't want
// to open a DB connection (or throw on a missing URL) at build time, only when
// a query actually runs at request time.

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Supabase connection string.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  client = globalForPrisma.prisma ?? new PrismaClient({ adapter });

  // Avoid creating a new client on every hot-reload in development.
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// A proxy so callers can `import { prisma }` and use it like a normal client,
// while the real connection is deferred to first use.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
