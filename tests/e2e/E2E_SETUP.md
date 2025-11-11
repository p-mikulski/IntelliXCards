# E2E Testing Setup Guide

This guide explains how to set up and run E2E tests for the project.

## Prerequisites

1. A Supabase project with authentication enabled
2. Node.js and npm installed
3. Playwright installed (automatically handled by `npm install`)

## Setup Steps

### 1. Configure Environment Variables

Copy the template file to create your test environment configuration:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` and fill in your actual values:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# E2E Test User Credentials
E2E_USERNAME=test-playwright@example.com
E2E_PASSWORD=YourSecurePassword123!

# OpenRouter API Key (for AI features)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### 2. Create the Test User

The test user must exist and be **confirmed** in your Supabase project. You have two options:

#### Option A: Manual Creation (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User > Create new user**
4. Enter the email and password from your `.env.test` file
5. Make sure **Auto Confirm User** is checked or manually confirm the email

#### Option B: Using the Reset Script

```bash
npx tsx scripts/reset-test-user.ts
```

This will attempt to create the user. If email confirmation is required, follow the instructions in the Supabase Dashboard.

### 3. Verify the Setup

Test that your credentials work:

```bash
npx tsx scripts/test-direct-login.ts
```

You should see:

```
✅ Login successful!
```

## Running E2E Tests

### Run all tests

```bash
npm run test:e2e
```

### Run with UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run in debug mode

```bash
npm run test:e2e:debug
```

## Test Architecture

- **Test files**: `tests/e2e/*.spec.ts`
- **Page objects**: `tests/e2e/page-objects/`
- **Global setup**: `tests/e2e/global-setup.ts` (validates test user before running tests)
- **Configuration**: `playwright.config.ts`

## Important Notes

### Security

- `.env.test` is gitignored - never commit this file
- Use the template file `.env.test.example` to document required variables
- Test credentials should be for a dedicated test account only

### Email Confirmation

The test user **must** have a confirmed email address. If you see errors about email confirmation:

1. Go to Supabase Dashboard > Authentication > Settings
2. Either:
   - Disable email confirmation (for development only)
   - Or manually confirm the test user email in Dashboard > Authentication > Users

### Supabase Configuration

The tests use the remote Supabase instance by default (same as production). If you want to use a local Supabase instance:

1. Update `SUPABASE_URL` and `SUPABASE_KEY` in `.env.test`
2. Make sure your local Supabase is running (`supabase start`)

## Troubleshooting

### "User already registered" error

This means the user exists but the password in `.env.test` is incorrect. Either:

- Update the password in `.env.test` to match the existing user
- Or reset the user's password in Supabase Dashboard

### "Invalid login credentials" error

This means the user doesn't exist or the credentials are wrong:

- Verify the credentials in `.env.test`
- Check that the user exists in Supabase Dashboard
- Ensure the user's email is confirmed

### Tests timing out

- Increase the timeout in `playwright.config.ts`
- Check that the dev server is running properly
- Verify your internet connection (for remote Supabase)

## CI/CD Integration

For CI/CD pipelines (e.g., GitHub Actions):

1. Store secrets as environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `E2E_USERNAME`
   - `E2E_PASSWORD`
   - `OPENROUTER_API_KEY`

2. Create `.env.test` file in the CI pipeline before running tests

3. Set `CI=true` environment variable (Playwright automatically adjusts behavior)

Example GitHub Actions:

```yaml
- name: Create .env.test
  run: |
    echo "SUPABASE_URL=${{ secrets.SUPABASE_URL }}" >> .env.test
    echo "SUPABASE_KEY=${{ secrets.SUPABASE_KEY }}" >> .env.test
    echo "E2E_USERNAME=${{ secrets.E2E_USERNAME }}" >> .env.test
    echo "E2E_PASSWORD=${{ secrets.E2E_PASSWORD }}" >> .env.test
    echo "OPENROUTER_API_KEY=${{ secrets.OPENROUTER_API_KEY }}" >> .env.test

- name: Run E2E tests
  run: npm run test:e2e
```
