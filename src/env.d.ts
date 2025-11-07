/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { Runtime } from "@astrojs/cloudflare";

declare global {
  namespace App {
    interface Locals extends Runtime {
      user: { id: string; email: string } | null;
      supabase: SupabaseClient<Database>;
      runtime?: {
        env?: {
          SUPABASE_URL?: string;
          SUPABASE_KEY?: string;
          OPENROUTER_API_KEY?: string;
        };
      };
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
