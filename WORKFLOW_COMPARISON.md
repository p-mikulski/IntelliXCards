# Workflow Comparison: PR vs Master

## Overview

This document compares the two GitHub Actions workflows to highlight the differences between pull request validation and master branch deployment.

## Workflow Files

| Workflow              | File               | Trigger        | Purpose                     |
| --------------------- | ------------------ | -------------- | --------------------------- |
| **PR Validation**     | `pull-request.yml` | PR to master   | Quality checks before merge |
| **Master Deployment** | `master.yml`       | Push to master | Deploy to production        |

## Job Pipeline Comparison

### Pull Request Workflow

```
Trigger: Pull Request to master
├── lint (Code quality)
├── unit-test (runs after lint)
│   └── Uploads coverage artifacts
├── e2e-test (runs after lint, parallel with unit-test)
│   ├── Uses test environment
│   ├── Installs Playwright browsers
│   ├── Runs E2E tests
│   └── Uploads Playwright reports
└── status-comment (runs after all)
    └── Posts success comment on PR
```

### Master Deployment Workflow

```
Trigger: Push to master
├── lint (Code quality)
├── unit-test (runs after lint)
│   └── Uploads coverage artifacts
├── deploy (runs after lint + unit-test)
│   ├── Builds for Cloudflare
│   └── Deploys to Cloudflare Pages
└── status-notification (runs after all)
    └── Reports deployment status
```

## Key Differences

### 1. **E2E Tests**

| Workflow   | E2E Tests   | Reason                                          |
| ---------- | ----------- | ----------------------------------------------- |
| **PR**     | ✅ Included | Validate functionality before merge             |
| **Master** | ❌ Excluded | Speed up deployment, tests already passed in PR |

### 2. **Deployment**

| Workflow   | Deployment               | Target                 |
| ---------- | ------------------------ | ---------------------- |
| **PR**     | ❌ No deployment         | Validation only        |
| **Master** | ✅ Deploys to Cloudflare | Production environment |

### 3. **Environment Variables**

#### Pull Request (`pull-request.yml`)

```yaml
# E2E test job requires additional secrets
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
  E2E_USERNAME_ID: ${{ secrets.E2E_USERNAME_ID }}
  E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
  E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

#### Master Deployment (`master.yml`)

```yaml
# Build step requires Supabase secrets
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}

# Deploy step requires Cloudflare secrets
with:
  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  command: pages deploy dist --project-name=${{ secrets.CLOUDFLARE_PROJECT_NAME }}
```

### 4. **Execution Time**

| Workflow   | Estimated Time | Reason                          |
| ---------- | -------------- | ------------------------------- |
| **PR**     | ~5-8 minutes   | Includes E2E tests (Playwright) |
| **Master** | ~3-5 minutes   | No E2E tests, faster deployment |

### 5. **Notifications**

| Workflow   | Notification Type | Details                                  |
| ---------- | ----------------- | ---------------------------------------- |
| **PR**     | GitHub comment    | Posts detailed success message on PR     |
| **Master** | Console output    | Logs deployment status (success/failure) |

## Shared Features

Both workflows share these common features:

✅ **Linting** - ESLint code quality checks
✅ **Unit Tests** - Vitest with coverage
✅ **Node.js Caching** - Uses `.nvmrc` for version and npm cache
✅ **npm ci** - Consistent dependency installation
✅ **Artifact Uploads** - Coverage reports preserved for 7 days
✅ **Latest Actions** - All use current major versions

## Actions Version Consistency

Both workflows use identical action versions:

| Action                       | Version | Latest           |
| ---------------------------- | ------- | ---------------- |
| `actions/checkout`           | v5      | ✅               |
| `actions/setup-node`         | v6      | ✅               |
| `actions/upload-artifact`    | v5      | ✅               |
| `actions/github-script`      | v8      | ✅ (PR only)     |
| `cloudflare/wrangler-action` | v3      | ✅ (Master only) |

## Required Secrets by Workflow

### Pull Request Workflow

**Supabase (for unit tests):**

- `SUPABASE_URL`
- `SUPABASE_KEY`

**E2E Testing (for end-to-end tests):**

- `E2E_USERNAME_ID`
- `E2E_USERNAME`
- `E2E_PASSWORD`

**GitHub (automatic):**

- `GITHUB_TOKEN` (auto-provided for posting comments)

### Master Deployment Workflow

**Supabase (for build):**

- `SUPABASE_URL`
- `SUPABASE_KEY`

**Cloudflare (for deployment):**

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PROJECT_NAME`

## Best Practices Implemented

### ✅ Both Workflows Follow:

1. **Job Dependencies** - Sequential execution where needed (`needs:` clause)
2. **Environment Scoping** - Secrets attached to specific jobs, not global
3. **Caching Strategy** - Node.js version from `.nvmrc`, npm cache enabled
4. **Consistent Installation** - Always use `npm ci` for reproducible builds
5. **Artifact Preservation** - Coverage and reports saved for 7 days
6. **Latest Versions** - All actions use current major versions
7. **Fail-Fast** - Jobs stop on errors, preventing wasted resources

### 🎯 Workflow-Specific Optimizations:

**Pull Request:**

- Parallel execution of unit and E2E tests (both depend on lint)
- Test environment isolation
- Detailed PR comments for team visibility

**Master:**

- No E2E tests for faster deployment
- Environment variables at step level for security
- Simple status reporting

## Decision Tree: Which Workflow Runs?

```
Is this a Pull Request to master?
├── YES → Run pull-request.yml
│   ├── Lint code
│   ├── Run unit tests
│   ├── Run E2E tests
│   └── Post success comment
│
└── NO → Is this a push to master?
    ├── YES → Run master.yml
    │   ├── Lint code
    │   ├── Run unit tests
    │   ├── Deploy to Cloudflare
    │   └── Report status
    │
    └── NO → No workflow runs
```

## Summary

| Aspect           | PR Workflow                  | Master Workflow           |
| ---------------- | ---------------------------- | ------------------------- |
| **Purpose**      | Validate changes             | Deploy to production      |
| **E2E Tests**    | ✅ Yes                       | ❌ No                     |
| **Deployment**   | ❌ No                        | ✅ Yes                    |
| **Speed**        | Slower (complete validation) | Faster (skip E2E)         |
| **Secrets**      | 5 (Supabase + E2E)           | 5 (Supabase + Cloudflare) |
| **Notification** | PR comment                   | Console log               |

---

**Philosophy**: PR workflow is comprehensive (catch all issues), Master workflow is streamlined (fast deployment of validated code).
