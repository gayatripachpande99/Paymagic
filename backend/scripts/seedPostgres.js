import pg from "pg";
import "dotenv/config";
import { createSeedData } from "../data/seedData.js";
import { runMigrations } from "./runMigrations.js";

const { Pool } = pg;

const getSslConfig = (connString) => {
  if (process.env.PGSSL === "true" || process.env.PGSSL === "require") {
    return { rejectUnauthorized: false };
  }
  if (process.env.PGSSL === "false" || process.env.PGSSL === "disable") {
    return false;
  }
  if (connString) {
    if (connString.includes("sslmode=disable") || connString.includes("localhost") || connString.includes("127.0.0.1")) {
      return false;
    }
    if (
      connString.includes("neon.tech") ||
      connString.includes("supabase") ||
      connString.includes("render.com") ||
      connString.includes("amazonaws.com") ||
      connString.includes("sslmode=require")
    ) {
      return { rejectUnauthorized: false };
    }
  }
  return false;
};

export const seedPostgres = async () => {
  const dbUrl = process.env.DATABASE_URL;
  const poolConfig = dbUrl
    ? {
        connectionString: dbUrl,
        ssl: getSslConfig(dbUrl),
        connectionTimeoutMillis: 10000
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        database: process.env.PGDATABASE || "paymagic",
        ssl: getSslConfig(),
        connectionTimeoutMillis: 10000
      };

  const pool = new Pool(poolConfig);

  try {
    console.log("Connecting to PostgreSQL...");
    const client = await pool.connect();
    console.log("Connected to PostgreSQL! Running migrations first...");
    await runMigrations(pool);

    console.log("Generating canonical PayMagic enterprise seed data...");
    const seed = await createSeedData();

    // 1. Roles
    console.log(`Seeding ${seed.roles.length} roles...`);
    for (const role of seed.roles) {
      await client.query(
        `INSERT INTO roles (id, name, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [role.id, role.name, role.description || ""]
      );
    }

    // 2. Users
    console.log(`Seeding ${seed.users.length} users...`);
    for (const u of seed.users) {
      await client.query(
        `INSERT INTO users (id, employee_id, email, password_hash, full_name, phone, role, department, designation, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (employee_id) DO NOTHING`,
        [
          u.id,
          u.employee_id || u.employeeId,
          u.email,
          u.password_hash || "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
          u.full_name || u.name,
          u.phone || "",
          u.role,
          u.department || "Recovery Operations",
          u.designation || "",
          u.is_active !== false
        ]
      );
    }

    // 3. Customers
    console.log(`Seeding ${seed.customers.length} customers...`);
    for (const c of seed.customers) {
      await client.query(
        `INSERT INTO customers (id, customer_code, full_name, phone_masked, phone_raw, current_address, city, state, pincode, credit_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (customer_code) DO NOTHING`,
        [
          c.id,
          c.customer_code,
          c.full_name,
          c.phone_masked,
          c.phone_raw || c.phone_masked,
          c.current_address || "Address on File",
          c.city || "Pune",
          c.state || "Maharashtra",
          c.pincode || "411001",
          c.credit_score || 650
        ]
      );
    }

    // 4. Loan Cases
    console.log(`Seeding ${seed.loanCases.length} loan cases...`);
    for (const lc of seed.loanCases) {
      await client.query(
        `INSERT INTO loan_cases (
          id, case_number, customer_id, lender_name, loan_type, principal_amount,
          outstanding_amount, dpd_bucket, status, priority, assigned_to_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (case_number) DO NOTHING`,
        [
          lc.id,
          lc.case_number,
          lc.customer_id,
          lc.lender_name || "Bajaj Finserve",
          lc.loan_type || "Personal Loan",
          lc.principal_amount || 100000,
          lc.outstanding_amount || 50000,
          lc.dpd_bucket || "90+",
          lc.status || "New",
          lc.priority || "MEDIUM",
          lc.assigned_to_id || null
        ]
      );
    }

    client.release();
    console.log("🎉 PostgreSQL Database successfully seeded with PayMagic Enterprise data!");
  } catch (err) {
    console.error("PostgreSQL Seeding failed:", err.message);
  } finally {
    await pool.end();
  }
};

// Direct execution
if (process.argv[1]?.includes("seedPostgres.js")) {
  seedPostgres();
}
