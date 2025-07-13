import type { Config } from "drizzle-kit";

export default {
    dialect: "postgresql",
    schema: "./lib/database/schema.ts",
    out: "./lib/database/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
} satisfies Config;
