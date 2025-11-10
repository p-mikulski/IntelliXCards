import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";

/* eslint-disable no-console */

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

async function testDirectLogin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");

  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseKey) throw new Error("Missing SUPABASE_KEY");

  const testEmail = process.env.E2E_USERNAME;
  if (!testEmail) throw new Error("Missing E2E_USERNAME");

  const testPassword = process.env.E2E_PASSWORD;
  if (!testPassword) throw new Error("Missing E2E_PASSWORD");

  console.log("🔧 Testing direct Supabase login...");

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.error("❌ Login failed:", error.message);
    process.exit(1);
  }

  console.log("✅ Login successful!");
  console.log(`👤 User ID: ${data.user.id}`);
  console.log(`📧 User email: ${data.user.email}`);
  console.log(`✉️ Email confirmed: ${data.user.email_confirmed_at !== null}`);

  await supabase.auth.signOut();
}

testDirectLogin();
