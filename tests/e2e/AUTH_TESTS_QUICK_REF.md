# 🧪 Authentication E2E Tests - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies (first time only)
npm install
npx playwright install chromium

# Run all auth tests
npx playwright test tests/e2e/auth.spec.ts

# Run with UI (recommended)
npx playwright test tests/e2e/auth.spec.ts --ui
```

## 📂 File Structure

```
tests/e2e/
├── auth.spec.ts              # 27 test cases
├── page-objects/
│   └── auth.page.ts          # LoginPage, RegisterPage, DashboardPage
├── AUTH_TESTS.md             # Detailed documentation
└── RUN_AUTH_TESTS.md         # Setup & troubleshooting
```

## 🎯 What's Tested (27 Tests)

| Category             | Tests | What's Covered                       |
| -------------------- | ----- | ------------------------------------ |
| **Registration**     | 7     | Valid signup, validation, duplicates |
| **Login**            | 8     | Valid login, errors, UX features     |
| **Logout**           | 1     | Session termination                  |
| **Protected Routes** | 2     | Access control                       |
| **User Journey**     | 1     | Full flow integration                |
| **Security**         | 8     | SQL injection, XSS, edge cases       |

## 💻 Common Commands

```bash
# Run specific test suite
npx playwright test tests/e2e/auth.spec.ts -g "Registration Flow"
npx playwright test tests/e2e/auth.spec.ts -g "Login Flow"
npx playwright test tests/e2e/auth.spec.ts -g "Security"

# Run single test
npx playwright test tests/e2e/auth.spec.ts -g "should allow a new user to register"

# Debug mode
npx playwright test tests/e2e/auth.spec.ts --debug

# Headed mode (see browser)
npx playwright test tests/e2e/auth.spec.ts --headed

# Generate HTML report
npx playwright test tests/e2e/auth.spec.ts --reporter=html
npx playwright show-report
```

## 🔧 Page Object Usage

```typescript
import { LoginPage, RegisterPage } from "./page-objects/auth.page";

test("example", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login("user@example.com", "password");

  // Check for errors
  const error = await loginPage.getEmailError();
  expect(error).toBeNull();
});
```

## ⚙️ Configuration

Edit `playwright.config.ts` to change:

- `baseURL`: Default `http://localhost:4321`
- `timeout`: Per-test timeout
- `retries`: Retry count for flaky tests
- `workers`: Parallel execution

## 🐛 Troubleshooting

| Problem            | Solution                                   |
| ------------------ | ------------------------------------------ |
| Server won't start | Check port 4321, verify `.env.test` exists |
| Tests timeout      | Increase timeout in config, check network  |
| Flaky tests        | Add `--retries=2` flag                     |
| Database errors    | Verify Supabase test project setup         |

## 📋 Test Data Pattern

```typescript
// Each test uses unique email to avoid conflicts
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "SecurePassword123!";
```

## ✅ Before Committing

- [ ] All tests pass locally
- [ ] No hardcoded credentials
- [ ] Test data is unique per run
- [ ] Documentation updated if needed

## 📚 Documentation Links

- [Detailed Test Docs](./AUTH_TESTS.md)
- [Setup Guide](./RUN_AUTH_TESTS.md)
- [Test Plan](../../.ai/tests/test-plan.md)
- [Playwright Guidelines](../../.cursor/rules/playwright-e2e-testing.mdc)

## 🎯 Coverage Map (Section 4.1)

✅ New user registers, logs in, logs out  
✅ Existing user logs in successfully  
✅ Incorrect credentials handling  
✅ Unauthenticated redirect to login  
✅ **Plus 23 additional edge cases and validations**

---

**Total Tests:** 27 | **Duration:** ~3-5 min | **Browser:** Chrome
