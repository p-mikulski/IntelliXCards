import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

async function resetTestUser() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in .env.test");
  }
  const testEmail = "test-playwright@example.com";
  const testPassword = "TestPassword123!";

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🔄 Creating/updating test user...");
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔑 Password: ${testPassword}`);

  // Try to sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: undefined,
    },
  });

  if (signUpError && !signUpError.message.includes("already registered")) {
    console.error("❌ Error:", signUpError.message);
    return;
  }

  if (signUpData.user) {
    console.log(`✅ User ID: ${signUpData.user.id}`);
    console.log(`✅ Email confirmed: ${signUpData.user.email_confirmed_at !== null}`);
  }

  // Try to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("❌ Sign in error:", signInError.message);
  } else {
    console.log("✅ Sign in successful!");
    await supabase.auth.signOut();
  }

  console.log("\n📝 Update your .env.test with:");
  console.log(`E2E_USERNAME=${testEmail}`);
  console.log(`E2E_PASSWORD=${testPassword}`);
}

resetTestUser();
