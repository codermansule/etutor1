/**
 * Migration runner for SBETUTOR
 * Connects directly to Supabase PostgreSQL and executes migration + seed files.
 * Usage: node scripts/run-migrations.mjs <db-password>
 */

import pg from "pg";
import dns from "dns";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Enable IPv6 resolution (Supabase direct connection uses IPv6)
dns.setDefaultResultOrder("verbatim");

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const projectRef = "qdncyphicsimvrpvpsmv";
const dbPassword = process.argv[2];

if (!dbPassword) {
  console.error("Usage: node scripts/run-migrations.mjs <db-password>");
  process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

async function runMigrations(client) {
  // Check existing tables
  const { rows: existingTables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log("--- Existing public tables ---");
  if (existingTables.length === 0) {
    console.log("  (none)");
  } else {
    existingTables.forEach((r) => console.log(`  ${r.table_name}`));
  }

  // Read and run migration files
  const migrationsDir = join(root, "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`\n--- Running ${files.length} migration files ---`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    try {
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }

  // Run seed data
  console.log("\n--- Running seed.sql ---");
  const seedPath = join(root, "supabase", "seed.sql");
  try {
    const seedSQL = readFileSync(seedPath, "utf-8");
    await client.query(seedSQL);
    console.log("  ✓ seed.sql");
  } catch (err) {
    console.error(`  ✗ seed.sql: ${err.message}`);
  }

  // Verify final state
  const { rows: finalTables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log("\n--- Final public tables ---");
  finalTables.forEach((r) => console.log(`  ${r.table_name}`));

  // Count subjects
  try {
    const { rows } = await client.query("SELECT COUNT(*) as cnt FROM public.subjects;");
    console.log(`\nSubjects seeded: ${rows[0].cnt}`);
  } catch { /* */ }
}

async function main() {
  console.log("=== SBETUTOR Migration Runner ===\n");
  console.log("Project ref:", projectRef);
  console.log("Connecting to database...");

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("Connected!\n");
    await runMigrations(client);
    console.log("\n✓ All done!");
  } catch (err) {
    console.error("Connection failed:", err.message);

    // Try pooler connections with multiple regions
    const regions = ["us-east-1", "eu-west-1", "eu-central-1", "ap-southeast-1"];
    for (const region of regions) {
      const poolerStr = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
      const poolerClient = new pg.Client({
        connectionString: poolerStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      });
      try {
        console.log(`\nTrying pooler ${region}...`);
        await poolerClient.connect();
        console.log(`Connected via ${region} pooler!\n`);
        await runMigrations(poolerClient);
        console.log("\n✓ All done!");
        await poolerClient.end();
        return;
      } catch (err2) {
        console.log(`  Failed: ${err2.message.slice(0, 80)}`);
        try { await poolerClient.end(); } catch { /* */ }
      }
    }

    console.error("\nAll connection methods failed.");
    console.error("Please run the SQL manually in the Supabase Dashboard SQL Editor.");
    console.error("Copy: supabase/migrations/*.sql + supabase/seed.sql");
  } finally {
    try { await client.end(); } catch { /* */ }
  }
}

main().catch(console.error);
