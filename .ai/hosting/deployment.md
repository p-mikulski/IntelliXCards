# Complete Deployment Guide - Cloudflare Pages

## Overview

This project is configured for automatic deployment to Cloudflare Pages via GitHub Actions. Every push to the `master` branch triggers a CI/CD pipeline that lints, tests, builds, and deploys the application.

The deployment uses:

- **GitHub Actions** for CI/CD automation
- **GitHub Environments** for secure secret management
- **Cloudflare Pages** for hosting and edge computing
- **Supabase** for backend services

## Prerequisites

### Required Accounts & Services

- GitHub repository with Actions enabled
- Cloudflare account with Pages access
- Supabase project (for database and auth)

### Local Development Setup

- Node.js 22.14.0 (specified in `.nvmrc`)
- npm for package management
- Git for version control

## GitHub Environments Configuration

This project uses **GitHub Environments** to manage secrets for different deployment scenarios:

- **`production`** environment → Used by Master deployment workflow (`master.yml`)

### Required Production Environment Secrets

Configure these in: `Repository Settings > Environments > production`

#### Supabase Secrets (Required for build)

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key

#### Cloudflare Secrets (Required for deployment)

- `CLOUDFLARE_API_TOKEN` - API token with Pages:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Name of your existing Pages project

### How to Configure Environment Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings → Environments**
3. Click on **`production`** environment
4. Click **"Add environment secret"**
5. Add all required secrets (see table above)

### How to Get Cloudflare Credentials

#### API Token

1. Visit: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers** or create custom with:
   - Permission: `Account > Cloudflare Pages > Edit`
4. Copy the token (shown only once)

#### Account ID

1. Go to: https://dash.cloudflare.com
2. Select your account
3. Copy **Account ID** from right sidebar

#### Project Name

1. Navigate to: **Workers & Pages** section
2. Find or create your Pages project
3. Use the project name (from project URL or title)

## Project Configuration

### Astro Configuration (`astro.config.mjs`)

The project uses conditional adapter selection based on the `CF_PAGES` environment variable:

```javascript
const adapter =
  process.env.CF_PAGES === "1" ? cloudflare({ imageService: "cloudflare" }) : node({ mode: "standalone" });
```

### Build Scripts (`package.json`)

Dedicated build script for Cloudflare deployment:

```json
{
  "scripts": {
    "build:cloudflare": "CF_PAGES=1 astro build"
  }
}
```

## CI/CD Pipeline Workflow

The `master.yml` workflow includes the following jobs:

### Pipeline Overview

```
lint → unit-test → deploy → status-notification
```

### 1. Lint Job

- Checks code quality and style
- Uses ESLint with project configuration
- Runs on: Every push to `master`

### 2. Unit Test Job

- Runs Vitest unit tests with coverage
- Requires environment variables for Supabase
- Uploads coverage reports as artifacts
- Depends on: `lint` job success

### 3. Deploy Job

- Builds the project for Cloudflare Pages
- Deploys to Cloudflare using Wrangler
- Depends on: `lint` and `unit-test` job success
- Uses latest actions:
  - `actions/checkout@v5`
  - `actions/setup-node@v6`
  - `cloudflare/wrangler-action@v3`

### 4. Status Notification Job

- Reports deployment status
- Runs always (even if previous jobs fail)
- Exits with error if deployment failed

## Cloudflare Pages Setup

### Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create application → Pages**
4. Choose your deployment method (we'll use GitHub Actions)

### Configure Build Settings (CRITICAL)

After creating the project:

1. Go to: **Settings → Builds & deployments → Edit configuration**
2. Set **Build command**: `npm run build:cloudflare`
3. Set **Build output directory**: `dist`
4. ⚠️ **Important**: Using `npm run build` will cause HTTP 500 errors!

### Environment Variables in Cloudflare

After first deployment, configure environment variables:

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to: **Settings → Environment variables**
3. Add for **Production** environment:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

## Deployment Process

### Automatic Deployment

Push to master branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin master
```

The workflow will:

1. **Lint** - Check code quality
2. **Unit Test** - Run tests with coverage
3. **Build** - Create Cloudflare-optimized build
4. **Deploy** - Upload to Cloudflare Pages
5. **Notify** - Report deployment status

### Manual Deployment

To deploy manually from your local machine:

```bash
# Build for Cloudflare
npm run build:cloudflare

# Deploy using Wrangler CLI
npx wrangler pages deploy dist --project-name=your-project-name
```

## Pre-Deployment Checklist

### GitHub Repository Setup (REQUIRED FIRST!)

- [ ] Configure Production Environment Secrets (Settings → Environments → production)
- [ ] Verify all required secrets are set (SUPABASE*URL, SUPABASE_KEY, CLOUDFLARE*\*)

### Cloudflare Setup

- [ ] Create Cloudflare Pages Project
- [ ] Configure Build Settings (command: `npm run build:cloudflare`, output: `dist`)
- [ ] Generate API Token with Pages:Edit permissions
- [ ] Get Account ID and Project Name

### Local Testing

- [ ] Test build locally: `npm run build:cloudflare`
- [ ] Verify build output in `dist/` directory
- [ ] No build errors

## Verification Steps

### GitHub Actions

- [ ] Workflow runs successfully
- [ ] All jobs pass: lint → unit-test → deploy → status-notification
- [ ] No red X marks in Actions tab

### Cloudflare Dashboard

- [ ] New deployment appears in Pages project
- [ ] Build logs show no errors
- [ ] Application is accessible at Pages URL

### Application Health

- [ ] Homepage loads without errors
- [ ] Authentication works
- [ ] Database operations work
- [ ] No console errors

## Troubleshooting

### Build Fails with "Missing Environment Variables"

**Problem**: Workflow shows empty environment variables
**Solution**:

- Ensure secrets are added to the **production** environment (not repository secrets)
- Verify secret names match exactly (case-sensitive)
- Check environment name in workflow: `environment: production`

### Deployment Fails with "Invalid API Token"

**Problem**: Cloudflare deployment fails with authentication error
**Solution**:

- Regenerate Cloudflare API token
- Ensure token has `Account > Cloudflare Pages > Edit` permissions
- Verify token is not expired

### HTTP 500 Errors After Deployment

**Problem**: Application shows HTTP 500 errors in production
**Root Cause**: Environment variables not accessible in Cloudflare runtime
**Solution**:

1. Add environment variables in Cloudflare Pages settings (not just GitHub)
2. Verify Supabase credentials are correct
3. Check Cloudflare function logs: Pages project → Functions → Real-time Logs

### Application Errors - Missing Supabase Credentials

**Problem**: "Missing Supabase credentials" in function logs
**Solution**:

- Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set in Cloudflare Pages environment variables
- Use the `anon` key, NOT the `service_role` key
- Verify credentials work in local development

### Build Output Directory Not Found

**Problem**: Deployment fails with "dist directory not found"
**Solution**:

- Verify `build:cloudflare` script runs successfully locally
- Check that build output goes to `dist/` directory
- Ensure Cloudflare build settings use correct output directory

### Wrong Environment Secrets Used

**Problem**: Production credentials being used in test environment
**Solution**:

- Verify workflow file references `environment: production`
- Ensure secrets exist in the correct environment
- Check for typos in environment names

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets or environment variables
2. **Test locally first** - Run `npm run build:cloudflare` before pushing
3. **Monitor deployments** - Check GitHub Actions logs for issues
4. **Use preview deployments** - Consider setting up preview environments for branches
5. **Keep dependencies updated** - Regularly update GitHub Actions versions
6. **Separate environments** - Use different Supabase projects for test/production
7. **Limit permissions** - Use minimal required permissions for API tokens

## Quick Reference

### Build Command

```bash
npm run build:cloudflare
```

### Deploy Command (Manual)

```bash
npx wrangler pages deploy dist --project-name=your-project-name
```

### View Logs

```bash
# GitHub Actions
Repository → Actions → Latest workflow run

# Cloudflare
Pages project → Deployments → Latest → View logs
```

### Environment Variables

```bash
# Required in GitHub (production environment)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_PROJECT_NAME=your-project-name

# Required in Cloudflare Pages (Production environment)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated**: November 7, 2025
**Status**: Ready for deployment
