import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const envContent = readFileSync(join(root, ".env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) env[key.trim()] = rest.join("=").trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

async function main() {
    console.log("=== SBETUTOR Phase 2 Database Verification ===\n");

    const tables = [
        "availability",
        "lesson_packages",
        "bookings",
        "reviews",
        "payments"
    ];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select("id").limit(1);
        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: OK (${data?.length ?? 0} rows sample)`);
        }
    }

    console.log("\n✓ Phase 2 verification complete!");
}

main().catch(console.error);
