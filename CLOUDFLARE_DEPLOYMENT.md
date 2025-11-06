# Cloudflare Pages Deployment Guide

## Overview

This project is configured for automatic deployment to Cloudflare Pages via GitHub Actions. Every push to the `master` branch triggers a CI/CD pipeline that lints, tests, builds, and deploys the application.

## Project Configuration

### 1. Astro Configuration (`astro.config.mjs`)

The project uses conditional adapter selection based on the `CF_PAGES` environment variable:

```javascript
const adapter =
  process.env.CF_PAGES === "1"
    ? cloudflare({ imageService: "cloudflare" })
    : node({ mode: "standalone" });
```

### 2. Build Script (`package.json`)

A dedicated build script for Cloudflare deployment:

```json
{
  "scripts": {
    "build:cloudflare": "CF_PAGES=1 astro build"
  }
}
```

## Required GitHub Secrets

Configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Supabase Secrets
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key

### Cloudflare Secrets
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Name of your Cloudflare Pages project

### How to Get Cloudflare Credentials

#### API Token
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **My Profile > API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template or create custom token with:
   - Permissions: `Account > Cloudflare Pages > Edit`
5. Copy the token (you'll only see it once!)

#### Account ID
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Find **Account ID** in the right sidebar

#### Project Name
1. Go to **Workers & Pages** in Cloudflare Dashboard
2. Create or select your Pages project
3. Use the project name (visible in the project URL)

## CI/CD Pipeline Workflow

The `master.yml` workflow includes the following jobs:

### 1. **Lint** (`lint`)
- Checks code quality and style
- Uses ESLint with project configuration
- Runs on: Every push to `master`

### 2. **Unit Tests** (`unit-test`)
- Runs Vitest unit tests with coverage
- Requires environment variables for Supabase
- Uploads coverage reports as artifacts
- Depends on: `lint` job success

### 3. **Deploy** (`deploy`)
- Builds the project for Cloudflare Pages
- Deploys to Cloudflare using Wrangler
- Depends on: `lint` and `unit-test` job success
- Uses latest actions:
  - `actions/checkout@v5`
  - `actions/setup-node@v6`
  - `cloudflare/wrangler-action@v3`

### 4. **Status Notification** (`status-notification`)
- Reports deployment status
- Runs always (even if previous jobs fail)
- Exits with error if deployment failed

## Workflow Features

✅ **No E2E Tests** - E2E tests are excluded from the deployment pipeline (only run on PRs)

✅ **Environment Variables** - Supabase credentials are injected during build

✅ **Artifact Uploads** - Coverage reports are preserved for 7 days

✅ **Node.js Caching** - Dependencies are cached using `.nvmrc`

✅ **Latest Actions** - All GitHub Actions use the latest major versions

## Manual Deployment

To deploy manually from your local machine:

```bash
# Build for Cloudflare
npm run build:cloudflare

# Deploy using Wrangler CLI (install first: npm i -g wrangler)
wrangler pages deploy dist --project-name=your-project-name
```

## Environment Variables in Cloudflare

After deployment, configure environment variables in Cloudflare Pages:

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to **Settings > Environment variables**
3. Add the following for **Production**:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon/public key

## Troubleshooting

### Build Fails with "Missing Environment Variables"
- Ensure all required secrets are configured in GitHub
- Verify secret names match exactly (case-sensitive)

### Deployment Fails with "Invalid API Token"
- Regenerate your Cloudflare API token
- Ensure token has `Cloudflare Pages:Edit` permissions

### Application Errors After Deployment
- Check environment variables in Cloudflare Pages settings
- Verify Supabase credentials are correct
- Check Cloudflare Pages function logs

### Build Output Directory Not Found
- The workflow expects build output in `dist/` directory
- Verify `build:cloudflare` script runs successfully locally

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets or environment variables
2. **Test locally first** - Run `npm run build:cloudflare` before pushing
3. **Monitor deployments** - Check GitHub Actions logs for issues
4. **Use preview deployments** - Consider setting up preview environments for branches
5. **Keep dependencies updated** - Regularly update GitHub Actions versions

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
