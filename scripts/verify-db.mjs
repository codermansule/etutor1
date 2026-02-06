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
  console.log("=== ETUTOR Database Verification ===\n");

  // 1. Check profiles table
  const { data: profiles, error: profErr } = await supabase.from("profiles").select("id").limit(1);
  console.log(`profiles table: ${profErr ? "ERROR - " + profErr.message : "OK (" + (profiles?.length ?? 0) + " rows sample)"}`);

  // 2. Check subjects table + count
  const { data: subjects, error: subErr } = await supabase.from("subjects").select("id, name, slug, category, parent_id");
  if (subErr) {
    console.log(`subjects table: ERROR - ${subErr.message}`);
  } else {
    const parentSubjects = subjects.filter(s => !s.parent_id);
    const childSubjects = subjects.filter(s => s.parent_id);
    console.log(`subjects table: OK — ${subjects.length} total (${parentSubjects.length} parent, ${childSubjects.length} children)`);

    // Count by category
    const categories = {};
    for (const s of parentSubjects) {
      categories[s.category] = (categories[s.category] || 0) + 1;
    }
    for (const [cat, count] of Object.entries(categories)) {
      console.log(`  ${cat}: ${count} subjects`);
    }
  }

  // 3. Check tutor_profiles table
  const { data: tutors, error: tutErr } = await supabase.from("tutor_profiles").select("id").limit(1);
  console.log(`tutor_profiles table: ${tutErr ? "ERROR - " + tutErr.message : "OK (" + (tutors?.length ?? 0) + " rows sample)"}`);

  // 4. Check tutor_subjects table
  const { data: ts, error: tsErr } = await supabase.from("tutor_subjects").select("id").limit(1);
  console.log(`tutor_subjects table: ${tsErr ? "ERROR - " + tsErr.message : "OK (" + (ts?.length ?? 0) + " rows sample)"}`);

  // 5. Verify a sample subject
  const { data: sample } = await supabase.from("subjects").select("*").eq("slug", "english").single();
  if (sample) {
    console.log(`\nSample subject: "${sample.name}" (${sample.category}) — ${sample.description?.slice(0, 60)}...`);
  }

  // 6. Verify child subjects
  if (sample) {
    const { data: children } = await supabase.from("subjects").select("name, slug").eq("parent_id", sample.id);
    if (children?.length) {
      console.log(`Children of English: ${children.map(c => c.name).join(", ")}`);
    }
  }

  console.log("\n✓ Verification complete!");
}

main().catch(console.error);
