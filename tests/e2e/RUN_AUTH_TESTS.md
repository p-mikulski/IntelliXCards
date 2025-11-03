# Running Authentication E2E Tests

## Prerequisites

Before running the E2E authentication tests, ensure you have:

1. **Environment Variables**
   Create a `.env.test` file with your test Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=your_test_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
   ```

2. **Dependencies Installed**
   ```bash
   npm install
   npx playwright install chromium
   ```

3. **Development Server**
   The tests require the dev server to be running. Playwright will start it automatically.

## Running the Tests

### Run all authentication tests
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run with HTML reporter
```bash
npx playwright test tests/e2e/auth.spec.ts --reporter=html
```

### Run in UI mode (recommended for development)
```bash
npx playwright test tests/e2e/auth.spec.ts --ui
```

### Run specific test suite
```bash
# Registration tests only
npx playwright test tests/e2e/auth.spec.ts -g "Registration Flow"

# Login tests only
npx playwright test tests/e2e/auth.spec.ts -g "Login Flow"

# Security tests only
npx playwright test tests/e2e/auth.spec.ts -g "Edge Cases and Security"
```

### Run in debug mode
```bash
npx playwright test tests/e2e/auth.spec.ts --debug
```

### Run in headed mode (see the browser)
```bash
npx playwright test tests/e2e/auth.spec.ts --headed
```

## Test Structure

The authentication test suite covers 27 test cases across 6 categories:

1. **Registration Flow** (7 tests)
2. **Login Flow** (8 tests)
3. **Logout Flow** (1 test)
4. **Protected Routes** (2 tests)
5. **Complete User Journey** (1 test)
6. **Edge Cases and Security** (8 tests)

## Expected Test Duration

- Full suite: ~3-5 minutes
- Individual test: ~5-15 seconds

## Troubleshooting

### Server won't start
- Check if port 4321 is already in use
- Verify your `.env.test` file exists and is properly configured

### Tests timeout
- Increase timeout in `playwright.config.ts`:
  ```typescript
  timeout: 30000, // 30 seconds per test
  ```

### Database issues
- Ensure test Supabase project has RLS policies configured
- Verify auth is enabled in Supabase

### Flaky tests
- Run with `--retries=2` flag:
  ```bash
  npx playwright test tests/e2e/auth.spec.ts --retries=2
  ```

## CI/CD Integration

The tests are configured to run in CI with:
- 2 retries for flaky test tolerance
- Single worker for consistency
- HTML report generation

See `playwright.config.ts` for CI-specific configuration.
