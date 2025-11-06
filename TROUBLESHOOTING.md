# Troubleshooting Guide - GitHub Actions & Cloudflare Deployment

## Error: HTTP 500 - Missing Supabase Credentials in Cloudflare Runtime

### Problem
When accessing your deployed Cloudflare Pages site, you see HTTP 500 errors, and the Cloudflare Functions logs show:
```
Error: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.
```

### Root Cause
The issue is **how environment variables are accessed** in Cloudflare Pages Functions. Using `import.meta.env` doesn't work in Cloudflare Workers/Pages - you need to access them through `locals.runtime.env`.

### Solution

The code has been updated to properly access environment variables in both Node.js (dev) and Cloudflare (production):

1. **`src/db/supabase.client.ts`** - Updated to accept `env` parameter:
```typescript
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  env?: Record<string, string>;
}) => {
  // In Cloudflare Pages, environment variables come from context.env
  // In Node.js (dev/local), they come from import.meta.env
  const supabaseUrl = context.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseKey = context.env?.SUPABASE_KEY || import.meta.env.SUPABASE_KEY;
  // ...
}
```

2. **`src/middleware/index.ts`** - Updated to pass environment variables:
```typescript
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Get environment variables from Cloudflare runtime (if available)
  const env = locals.runtime?.env;

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
    env,
  });
  // ...
});
```

3. **`src/env.d.ts`** - Added Runtime type:
```typescript
import type { Runtime } from "@astrojs/cloudflare";

declare global {
  namespace App {
    interface Locals extends Runtime {
      user: { id: string; email: string } | null;
      supabase: SupabaseClient<Database>;
    }
  }
}
```

### Verification Steps

1. **Ensure environment variables are set in Cloudflare Pages**:
   - Go to Cloudflare Dashboard → Workers & Pages → Your Project
   - Settings → Environment variables
   - Confirm `SUPABASE_URL` and `SUPABASE_KEY` are set for Production

2. **Deploy the updated code**:
   - Commit and push the changes
   - Wait for GitHub Actions to deploy

3. **Check Cloudflare Functions logs**:
   - Go to your Pages project → Functions → Real-time Logs
   - Visit your site
   - Verify no more "Missing Supabase credentials" errors

---

## Error: Missing SESSION KV Binding

### Problem
The Astro Cloudflare adapter automatically enables session storage using Cloudflare KV, but you haven't configured the required KV binding.

### Solution

Create a KV namespace and bind it (even if you don't use Astro sessions):

1. **Go to Cloudflare Dashboard** → **Workers & Pages** → **KV**
2. **Create namespace** (e.g., `intellixcards-sessions`)
3. **Bind to your project**:
   - Your Pages project → **Settings** → **Functions**
   - **KV namespace bindings** → Add binding:
     - Variable name: `SESSION`
     - KV namespace: Select the namespace you created
   - **Save** and redeploy

---

## Error: "Your project's URL and Key are required to create a Supabase client!"

### Problem
Build fails during GitHub Actions with:
```
Your project's URL and Key are required to create a Supabase client!
Check your Supabase project's API settings to find these values
https://supabase.com/dashboard/project/_/settings/api
```

And the environment variables show as empty:
```
env:
  SUPABASE_URL: 
  SUPABASE_KEY: 
```

### Root Causes
1. GitHub Secrets are not configured
2. Secrets are in wrong location (Repository vs Environment)
3. Wrong environment is being used

### Solution

#### Option 1: Using GitHub Environments (RECOMMENDED ✅)

This project uses **GitHub Environments** to separate test and production secrets.

1. Go to: **Settings → Environments**
2. Select **`production`** environment
3. Click **"Add environment secret"**
4. Add these secrets to the **production** environment:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_KEY` | `your-anon-key` | Supabase Dashboard → Settings → API → anon/public key |
| `CLOUDFLARE_API_TOKEN` | `your-api-token` | Cloudflare Dashboard → Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | `your-account-id` | Cloudflare Dashboard → Account ID |
| `CLOUDFLARE_PROJECT_NAME` | `your-project-name` | Your Cloudflare Pages project name |

> 📖 **See detailed guide**: [GITHUB_ENVIRONMENTS.md](./GITHUB_ENVIRONMENTS.md)

#### Option 2: Using Repository Secrets (Alternative)

If you prefer repository-level secrets (not recommended):
1. Remove `environment: production` from `.github/workflows/master.yml`
2. Add secrets to: **Settings → Secrets and variables → Actions → Repository secrets**

#### Step 2: Verify Secret Names

Make sure the secret names **exactly match** (case-sensitive):
- ✅ `SUPABASE_URL` (correct)
- ❌ `SUPABASE_url` (wrong)
- ❌ `supabase_url` (wrong)

And verify they are in the **production environment**, not repository secrets!

#### Step 3: Get Supabase Credentials

1. Visit: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → Use for `SUPABASE_URL`
   - **`anon` `public` key** → Use for `SUPABASE_KEY`

> ⚠️ **Important**: Use the `anon` key, NOT the `service_role` key!

#### Step 4: Re-run the Workflow

After adding secrets:
1. Go to: **Actions** tab
2. Select the failed workflow run
3. Click **"Re-run all jobs"**

Or push a new commit:
```bash
git commit --allow-empty -m "Trigger workflow after adding secrets"
git push origin master
```

---

## Error: HTTP 500 on Cloudflare Pages (Environment Variables Configured)

### Problem
- Deployment succeeds in GitHub Actions ✅
- Cloudflare Pages shows successful deployment ✅
- Environment variables are configured in Cloudflare ✅
- But website shows **HTTP ERROR 500** ❌

### Root Cause
Cloudflare is using **wrong build command**: `npm run build` instead of `npm run build:cloudflare`

This causes the application to be built with the **Node.js adapter** instead of the **Cloudflare adapter**, resulting in runtime errors.

### How to Identify This Issue

Check your Cloudflare deployment logs. Look for:
```
Executing user command: npm run build
```

It should say:
```
Executing user command: npm run build:cloudflare
```

### Solution

#### Update Cloudflare Pages Build Configuration:

1. Go to: **Cloudflare Dashboard** → **Workers & Pages** → Your project
2. Navigate to: **Settings** → **Builds & deployments**
3. Find: **Build configurations** section
4. Click: **"Edit configuration"**
5. Set:
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `dist`
   - **Root directory**: (leave empty or `/`)
6. Click: **"Save"**
7. Go to: **Deployments** tab
8. Click: **"Retry deployment"** on latest deployment

#### Why This Matters:

| Build Command | Adapter Used | Works on Cloudflare? |
|--------------|--------------|---------------------|
| `npm run build` | Node.js adapter | ❌ No - causes 500 errors |
| `npm run build:cloudflare` | Cloudflare adapter | ✅ Yes - works correctly |

The `build:cloudflare` script sets `CF_PAGES=1` which tells Astro to use the Cloudflare adapter:

```json
{
  "scripts": {
    "build": "astro build",  // ❌ Uses Node adapter
    "build:cloudflare": "CF_PAGES=1 astro build"  // ✅ Uses Cloudflare adapter
  }
}
```

#### Alternative: Create wrangler.toml

If you prefer, create a `wrangler.toml` file in the project root:

```toml
name = "intellixcards"
compatibility_date = "2024-11-01"

[build]
command = "npm run build:cloudflare"

[build.upload]
format = "service-worker"
```

Then commit and push:
```bash
git add wrangler.toml
git commit -m "Add wrangler.toml with correct build command"
git push origin master
```

### Verification

After fixing, check the new deployment logs. You should see:
```
Executing user command: npm run build:cloudflare
19:XX:XX [@astrojs/cloudflare] Enabling sessions with Cloudflare KV...
```

And the website should load without 500 errors! ✅

---

## Error: Astro.request.headers was used when rendering prerendered page

### Problem
Build warning or error:
```
`Astro.request.headers` was used when rendering the route `src/pages/register.astro`.
`Astro.request.headers` is not available on prerendered pages.
```

### Root Cause
Page is set to `prerender = true` but middleware tries to access request headers.

### Solution

Set `prerender = false` for pages that need middleware access:

```astro
---
export const prerender = false; // Changed from true
return Astro.redirect("/auth/register", 307);
---
```

This has been fixed in:
- `src/pages/register.astro`

---

## Error: "Invalid binding `SESSION`" (Cloudflare KV)

### Problem
Build warning:
```
[@astrojs/cloudflare] Enabling sessions with Cloudflare KV with the "SESSION" KV binding.
[@astrojs/cloudflare] If you see the error "Invalid binding `SESSION`" in your build output,
you need to add the binding to your wrangler config file.
```

### Root Cause
Cloudflare adapter expects a KV namespace for sessions, but it's not configured.

### Solution (if using sessions)

Create `wrangler.toml` in project root:
```toml
name = "your-project-name"
compatibility_date = "2024-11-01"

[[kv_namespaces]]
binding = "SESSION"
id = "your-kv-namespace-id"
```

### Solution (if NOT using sessions)

This warning can be safely ignored if you're not using Cloudflare KV sessions. The build will still succeed.

---

## Error: Environment Variables Not Available in Cloudflare

### Problem
Application deploys successfully but shows errors at runtime like:
- Authentication doesn't work
- Database queries fail
- "Missing credentials" errors

### Root Cause
Environment variables are set in GitHub Secrets but not in Cloudflare Pages.

### Solution

#### Add Environment Variables in Cloudflare:

1. Go to: **Cloudflare Dashboard**
2. Navigate to: **Workers & Pages** → Your project
3. Go to: **Settings** → **Environment variables**
4. Click **"Add variables"**
5. Add for **Production** environment:

| Variable Name | Value |
|--------------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | `your-anon-key` |

6. Click **"Save"**
7. **Redeploy** your application (or push a new commit)

> 📝 **Note**: Environment variables in Cloudflare Pages are separate from GitHub Secrets. You need to configure both!

---

## Error: Deployment to Cloudflare Pages Fails

### Problem
GitHub Actions build succeeds but deployment fails with errors like:
- "Invalid API token"
- "Account not found"
- "Project not found"

### Solutions

#### Invalid API Token

**Symptoms:**
```
Error: Authentication error: Invalid API token
```

**Solution:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"** or create custom
4. Permissions needed:
   - `Account → Cloudflare Pages → Edit`
5. Copy the token (shown only once!)
6. Update GitHub Secret: `CLOUDFLARE_API_TOKEN`

#### Account Not Found

**Symptoms:**
```
Error: Account not found
```

**Solution:**
1. Go to: https://dash.cloudflare.com
2. Select your account
3. Copy **Account ID** from right sidebar
4. Update GitHub Secret: `CLOUDFLARE_ACCOUNT_ID`

#### Project Not Found

**Symptoms:**
```
Error: Project not found: your-project-name
```

**Solution:**

**Option 1**: Create the project first
1. Go to: **Workers & Pages** in Cloudflare Dashboard
2. Click **"Create application"** → **"Pages"**
3. Name it (e.g., "intellixcards")
4. Skip the setup (we'll deploy via GitHub Actions)
5. Update GitHub Secret: `CLOUDFLARE_PROJECT_NAME` with exact project name

**Option 2**: Check project name
1. Go to existing project in Cloudflare Pages
2. Copy the exact project name from URL or title
3. Update GitHub Secret: `CLOUDFLARE_PROJECT_NAME`

---

## Error: Build Succeeds Locally but Fails in CI

### Problem
`npm run build:cloudflare` works locally but fails in GitHub Actions.

### Common Causes & Solutions

#### 1. Missing Environment Variables

**Local:** Uses `.env.test` or `.env` file
**CI:** Requires GitHub Secrets

**Solution:** Configure all GitHub Secrets (see above)

#### 2. Different Node.js Versions

**Check local version:**
```bash
node --version
```

**Check `.nvmrc`:**
```
22.14.0
```

**Solution:** Ensure `.nvmrc` has correct version

#### 3. Dependency Issues

**Local:** Might have cached or different versions
**CI:** Fresh install with `npm ci`

**Solution:**
```bash
# Clean local environment
rm -rf node_modules package-lock.json
npm install
npm run build:cloudflare
```

---

## Quick Diagnostic Checklist

When deployment fails, check:

- [ ] Secrets are in **`production` environment** (Settings → Environments → production)
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `CLOUDFLARE_PROJECT_NAME`

- [ ] Workflow uses correct environment: `environment: production`

- [ ] Secret names match exactly (case-sensitive)

- [ ] Cloudflare Pages project exists

- [ ] Cloudflare API token has correct permissions

- [ ] Environment variables are set in Cloudflare Pages (Settings → Environment variables)

- [ ] `.nvmrc` file exists with correct Node version

- [ ] Local build works: `npm run build:cloudflare`

---

## Understanding GitHub Environments

This project uses **two separate environments**:

| Environment | Used By | Purpose | Secrets |
|------------|---------|---------|---------|
| **`test`** | `pull-request.yml` | PR validation | Test Supabase + E2E credentials |
| **`production`** | `master.yml` | Production deployment | Production Supabase + Cloudflare |

**Why empty secrets?** If secrets are in the wrong environment (e.g., production secrets in repository-level instead of production environment), the workflow won't find them.

📖 **Full guide**: [GITHUB_ENVIRONMENTS.md](./GITHUB_ENVIRONMENTS.md)

---

## Getting Help

### View GitHub Actions Logs

1. Go to repository → **Actions** tab
2. Click on failed workflow run
3. Click on failed job
4. Expand the failed step to see detailed logs

### View Cloudflare Deployment Logs

1. Go to Cloudflare Dashboard
2. Navigate to: **Workers & Pages** → Your project
3. Click on: **Deployments**
4. Select the failed deployment
5. Click **"View logs"**

### Test Locally

```bash
# Test with production environment variables
npm run build:cloudflare

# Test development server
npm run dev:test
```

---

## Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Supabase API Settings](https://supabase.com/dashboard/project/_/settings/api)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
