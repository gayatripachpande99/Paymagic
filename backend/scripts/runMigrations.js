import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async (customPool = null) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!customPool && !dbUrl) {
    console.log("[Migrations] No DATABASE_URL configured. Skipping PostgreSQL migration execution.");
    return { executed: 0, skipped: 0, status: "SKIPPED_NO_DB" };
  }

  const pool = customPool || new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  const client = await pool.connect();
  const ADVISORY_LOCK_ID = 982348234;

  try {
    // Acquire PostgreSQL session advisory lock to prevent concurrent migration collisions
    console.log(`[Migrations] Acquiring session advisory lock (${ADVISORY_LOCK_ID})...`);
    await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_ID]);
    console.log(`[Migrations] Advisory lock acquired.`);

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read all .sql files in migrations directory
    const migrationsDir = path.resolve(__dirname, "../migrations");
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    let executedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const alreadyRun = await client.query(
        "SELECT id FROM _migrations WHERE name = $1",
        [file]
      );

      if (alreadyRun.rows.length > 0) {
        skippedCount++;
        continue;
      }

      console.log(`[Migrations] Executing migration: ${file}...`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sqlContent);
        await client.query(
          "INSERT INTO _migrations (name) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        executedCount++;
        console.log(`[Migrations] Successfully executed: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[Migrations] Error executing ${file}:`, err.message);
        throw err;
      }
    }

    console.log(`[Migrations] Complete. Executed: ${executedCount}, Skipped (Already applied): ${skippedCount}`);
    return { executed: executedCount, skipped: skippedCount, status: "SUCCESS" };
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_ID]);
      console.log(`[Migrations] Advisory lock released.`);
    } catch (unlockErr) {
      console.error("[Migrations] Error releasing advisory lock:", unlockErr.message);
    }
    client.release();
    if (!customPool) {
      await pool.end();
    }
  }
};

// Direct CLI invocation check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(res => {
      console.log("Migration process finished:", res);
      process.exit(0);
    })
    .catch(err => {
      console.error("Migration process failed:", err);
      process.exit(1);
    });
}

