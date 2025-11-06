# GitHub Environments Configuration Guide

## Overview

This project uses **GitHub Environments** to manage secrets for different deployment scenarios:

- **`test`** environment → Used by Pull Request workflow (`pull-request.yml`)
- **`production`** environment → Used by Master deployment workflow (`master.yml`)

## Current Configuration

### Pull Request Workflow (`pull-request.yml`)
```yaml
e2e-test:
  environment: test  # Uses 'test' environment
```

### Master Workflow (`master.yml`)
```yaml
unit-test:
  environment: production  # Uses 'production' environment

deploy:
  environment: production  # Uses 'production' environment
```

## Required Secrets by Environment

### Test Environment
Required for PR E2E testing:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SUPABASE_URL` | Test Supabase project URL | `https://test-project.supabase.co` |
| `SUPABASE_KEY` | Test Supabase anon key | `eyJhbGci...` |
| `E2E_USERNAME_ID` | Test user ID for E2E tests | `913d9219-c6a5-4d66-bc03-6b0d81c2b86c` |
| `E2E_USERNAME` | Test user email | `test-user@test.com` |
| `E2E_PASSWORD` | Test user password | `test-user` |

### Production Environment
Required for master branch deployment:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SUPABASE_URL` | Production Supabase project URL | `https://prod-project.supabase.co` |
| `SUPABASE_KEY` | Production Supabase anon key | `eyJhbGci...` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | `your-api-token` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | `your-account-id` |
| `CLOUDFLARE_PROJECT_NAME` | Cloudflare Pages project name | `intellixcards` |

## How to Configure Environment Secrets

### Step 1: Access Environments Settings

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Environments**
3. You should see two environments: `test` and `production`

### Step 2: Configure Test Environment

1. Click on **`test`** environment
2. Click **"Add environment secret"**
3. Add all required secrets for test environment (see table above)
4. Click **"Add secret"** for each one

### Step 3: Configure Production Environment

1. Click on **`production`** environment
2. Click **"Add environment secret"**
3. Add all required secrets for production environment (see table above)
4. Click **"Add secret"** for each one

## Environment Protection Rules (Optional)

You can add protection rules to the production environment:

1. Go to: **Settings** → **Environments** → **`production`**
2. Enable: **"Required reviewers"** (require manual approval before deployment)
3. Enable: **"Wait timer"** (add delay before deployment)
4. Enable: **"Deployment branches"** (restrict to `master` branch only)

Example configuration:
```yaml
Required reviewers: @your-username
Wait timer: 0 minutes (or add delay if needed)
Deployment branches: Selected branches → master
```

## How It Works

### Pull Request Flow
```
PR opened → pull-request.yml runs
  ↓
Uses 'test' environment
  ↓
Accesses test secrets: SUPABASE_URL, SUPABASE_KEY, E2E credentials
  ↓
Runs E2E tests against test database
```

### Master Branch Flow
```
Push to master → master.yml runs
  ↓
Uses 'production' environment
  ↓
Accesses production secrets: SUPABASE_URL, SUPABASE_KEY, Cloudflare credentials
  ↓
Builds and deploys to production Cloudflare Pages
```

## Key Differences: Repository Secrets vs Environment Secrets

| Type | Scope | Access | Use Case |
|------|-------|--------|----------|
| **Repository Secrets** | All workflows | Any workflow can access | Shared secrets, not environment-specific |
| **Environment Secrets** | Specific environment | Only workflows using that environment | Environment-specific credentials |

## Best Practices

✅ **Use separate Supabase projects** for test and production
✅ **Use different credentials** for each environment
✅ **Enable protection rules** for production environment
✅ **Never use production credentials** in test environment
✅ **Rotate credentials regularly**, especially after team member changes
✅ **Limit E2E test credentials** to minimal required permissions

## Troubleshooting

### Secret Not Found
**Problem:** Workflow shows empty environment variables

**Solution:**
1. Verify secret is added to the **correct environment** (not repository secrets)
2. Check environment name in workflow matches exactly: `environment: production`
3. Secret names must match exactly (case-sensitive)

### Wrong Environment Used
**Problem:** Test credentials being used in production

**Solution:**
1. Check workflow file has: `environment: production` (not `environment: test`)
2. Verify secrets exist in the correct environment

### Environment Not Found
**Problem:** Workflow fails with "Environment not found"

**Solution:**
1. Go to: **Settings** → **Environments**
2. Create the environment if it doesn't exist
3. Add required secrets to that environment

## Verification Checklist

After configuration, verify:

- [ ] `test` environment exists with 5 secrets (Supabase + E2E)
- [ ] `production` environment exists with 5 secrets (Supabase + Cloudflare)
- [ ] `pull-request.yml` references `environment: test`
- [ ] `master.yml` references `environment: production`
- [ ] Secret names match exactly in both environments and workflows
- [ ] Test environment uses test Supabase project
- [ ] Production environment uses production Supabase project

## Visual Reference

```
GitHub Repository
│
├── Settings
│   ├── Secrets and variables
│   │   └── Actions
│   │       └── Repository secrets (⚠️ NOT used in this project)
│   │
│   └── Environments
│       ├── test
│       │   ├── SUPABASE_URL (test project)
│       │   ├── SUPABASE_KEY (test project)
│       │   ├── E2E_USERNAME_ID
│       │   ├── E2E_USERNAME
│       │   └── E2E_PASSWORD
│       │
│       └── production
│           ├── SUPABASE_URL (production project)
│           ├── SUPABASE_KEY (production project)
│           ├── CLOUDFLARE_API_TOKEN
│           ├── CLOUDFLARE_ACCOUNT_ID
│           └── CLOUDFLARE_PROJECT_NAME
```

---

**Summary:** The master workflow now explicitly uses the `production` environment, ensuring it accesses production secrets instead of test or repository-level secrets. ✅
