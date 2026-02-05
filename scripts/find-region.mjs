import pg from "pg";

const projectRef = "qdncyphicsimvrpvpsmv";
const password = process.argv[2];
const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1",
  "ap-southeast-1", "ap-northeast-1", "sa-east-1",
];

async function tryRegion(region) {
  const connStr = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const { rows } = await client.query("SELECT 1 as ok");
    console.log(`  ✓ ${region} — CONNECTED!`);
    await client.end();
    return region;
  } catch (err) {
    console.log(`  ✗ ${region} — ${err.message.slice(0, 60)}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  console.log("Testing regions for project:", projectRef);
  for (const region of regions) {
    const found = await tryRegion(region);
    if (found) {
      console.log(`\nYour region: ${found}`);
      return;
    }
  }
  console.log("\nNo region worked. Trying direct connection...");
  const directStr = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  const client = new pg.Client({ connectionString: directStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    console.log("Direct connection works!");
    await client.end();
  } catch (err) {
    console.log("Direct connection failed:", err.message);
  }
}

main();
