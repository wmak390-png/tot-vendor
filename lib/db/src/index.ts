import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let poolInstance: any = null;
let dbInstance: any = null;

if (process.env.DATABASE_URL) {
  try {
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle(poolInstance, { schema });
  } catch (err) {
    console.warn("Could not connect to PostgreSQL with DATABASE_URL:", err);
  }
} else {
  console.warn("DATABASE_URL not set; running with mock database fallback.");
}

export const pool = poolInstance;
export const db = dbInstance ?? ({} as ReturnType<typeof drizzle>);


export * from "./schema";
