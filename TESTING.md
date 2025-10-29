# Testing Setup

This project uses **Vitest** for unit and integration tests and **Playwright** for end-to-end (E2E) tests.

## Tech Stack

- **Vitest** - Fast unit test framework with React Testing Library
- **Playwright** - Reliable E2E testing with Chromium
- **@testing-library/react** - Testing utilities for React components
- **@testing-library/user-event** - User interaction simulation

## Project Structure

```
10xdevs-project/
├── src/
│   ├── components/
│   │   └── **/*.test.tsx         # Unit tests colocated with components
│   ├── lib/
│   │   └── **/*.test.ts          # Service and utility tests
│   └── test/
│       └── setup.ts              # Global test setup
├── tests/
│   └── e2e/
│       ├── page-objects/         # Page Object Models
│       └── *.spec.ts             # E2E test specs
├── vitest.config.ts
└── playwright.config.ts
```

## Unit Testing with Vitest

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- EmptyState.test.tsx

# Filter by test name
npm test -- -t "should render title"
```

### Writing Unit Tests

Unit tests should be colocated with the code they test, using the `.test.ts` or `.test.tsx` extension.

**Example: Testing a React Component**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render with props", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should handle user interactions", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MyComponent onClick={handleClick} />);
    
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Testing Best Practices

- Use `describe` blocks to group related tests
- Follow the Arrange-Act-Assert pattern
- Use descriptive test names that explain the expected behavior
- Mock external dependencies with `vi.mock()`
- Test user interactions, not implementation details
- Use `screen` queries from Testing Library for accessible selectors

## E2E Testing with Playwright

### Running E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- landing.spec.ts

# Run tests in headed mode
npm run test:e2e -- --headed
```

### Writing E2E Tests

E2E tests should be placed in the `tests/e2e/` directory. Use the Page Object Model pattern for maintainability.

**Example: Page Object Model**

```typescript
// tests/e2e/page-objects/login.page.ts
import { type Page } from "@playwright/test";

export class LoginPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole("button", { name: /sign in/i }).click();
  }
}
```

**Example: E2E Test**

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";

test.describe("Authentication", () => {
  test("should login successfully", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("user@example.com", "password123");

    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### E2E Testing Best Practices

- Use Page Object Model for reusable page interactions
- Use semantic locators (role, label, text) over CSS selectors
- Isolate tests with browser contexts
- Use test hooks (`beforeEach`, `afterEach`) for setup/teardown
- Leverage auto-waiting - Playwright waits for elements automatically
- Use `expect` assertions with specific matchers
- Take screenshots on failure (configured automatically)
- Use API testing for setting up test data when possible

## Configuration

### Vitest Configuration

See `vitest.config.ts` for the complete configuration. Key features:

- **Global test APIs** enabled (`describe`, `it`, `expect`)
- **jsdom environment** for DOM testing
- **Path aliases** configured (`@/components`, `@/lib`, etc.)
- **Coverage** with v8 provider
- **Setup file** at `src/test/setup.ts`

### Playwright Configuration

See `playwright.config.ts` for the complete configuration. Key features:

- **Chromium only** (Desktop Chrome)
- **Base URL**: `http://localhost:4321`
- **Auto-start dev server** before tests
- **Traces** captured on first retry
- **Screenshots** on failure
- **HTML reporter** for results

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --run

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Vitest Issues

- **Import errors**: Check path aliases in `vitest.config.ts`
- **Module not found**: Ensure setup file is properly configured
- **React component errors**: Verify `@vitejs/plugin-react` is installed

### Playwright Issues

- **Browser not found**: Run `npx playwright install chromium`
- **Timeout errors**: Increase timeout in `playwright.config.ts`
- **Dev server issues**: Check that port 4321 is available

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
