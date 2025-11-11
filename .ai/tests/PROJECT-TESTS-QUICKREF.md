# Project Management Tests - Quick Reference

## Files Created

1. **`src/lib/services/project.service.test.ts`** - Service layer unit tests (21 tests)
2. **`src/components/hooks/useProjectDashboard.test.ts`** - React hook unit tests (15 tests)
3. **`.ai/tests/project-management-tests-summary.md`** - Comprehensive test documentation

## Running the Tests

### Run all project management tests

```powershell
npx vitest run src/lib/services/project.service.test.ts src/components/hooks/useProjectDashboard.test.ts
```

### Run service tests only

```powershell
npx vitest run src/lib/services/project.service.test.ts
```

### Run hook tests only

```powershell
npx vitest run src/components/hooks/useProjectDashboard.test.ts
```

### Watch mode (for development)

```powershell
npx vitest watch src/lib/services/project.service.test.ts
```

### Run with UI

```powershell
npx vitest --ui
```

### Run with coverage

```powershell
npx vitest --coverage
```

## Test Structure

### ProjectService Tests

```
ProjectService
├── createProject (5 tests)
│   ├── Success scenarios
│   ├── Validation errors
│   └── Database errors
├── listProjects (3 tests)
│   ├── Success scenarios
│   └── Error handling
├── getProjectById (4 tests)
│   ├── Success scenarios
│   ├── Not found errors
│   └── Access control
├── updateProject (5 tests)
│   ├── Success scenarios
│   ├── Validation errors
│   └── Database errors
└── deleteProject (4 tests)
    ├── Success scenarios
    ├── Cascade deletes
    └── Error handling
```

### useProjectDashboard Tests

```
useProjectDashboard
├── fetchProjects (4 tests)
│   ├── Successful fetch
│   ├── Empty state
│   └── Error handling
├── handleCreateProject (3 tests)
│   ├── Optimistic UI
│   └── Rollback on error
├── handleUpdateProject (2 tests)
│   ├── Optimistic UI
│   └── Rollback on error
├── handleDeleteProject (3 tests)
│   ├── Optimistic UI
│   └── Rollback on error
└── dialog state management (3 tests)
    ├── Create dialog
    ├── Edit dialog
    └── Delete dialog
```

## Key Testing Patterns Used

### 1. Mocking Supabase Client

```typescript
const createMockSupabaseClient = () => {
  return {
    from: vi.fn(() => mockQueryBuilder),
  } as unknown as SupabaseClient;
};
```

### 2. Mocking Fetch API

```typescript
global.fetch = vi.fn();

(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
  ok: true,
  json: async () => mockData,
});
```

### 3. Testing Optimistic UI

```typescript
// Act - Start operation
act(() => {
  result.current.handleCreateProject(command);
});

// Assert - Check optimistic state
await waitFor(() => {
  expect(result.current.projects[0].optimisticState).toBe("syncing");
});
```

### 4. Testing Rollback on Error

```typescript
// Mock failure
(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
  ok: false,
});

// Act
await act(async () => {
  await result.current.handleCreateProject(command);
});

// Assert - Should rollback
expect(result.current.projects).toHaveLength(0);
expect(toast.error).toHaveBeenCalled();
```

## Coverage Map

| Feature           | Service Tests | Hook Tests | Total  |
| ----------------- | ------------- | ---------- | ------ |
| Create Project    | 5             | 3          | 8      |
| List Projects     | 3             | 4          | 7      |
| Get Project       | 4             | 0          | 4      |
| Update Project    | 5             | 2          | 7      |
| Delete Project    | 4             | 3          | 7      |
| Dialog Management | 0             | 3          | 3      |
| **Total**         | **21**        | **15**     | **36** |

## Vitest Best Practices Applied

✅ Used `vi.fn()` for function mocks  
✅ Applied `vi.mock()` factory patterns  
✅ Followed Arrange-Act-Assert pattern  
✅ Enabled TypeScript strict typing  
✅ Created descriptive test names  
✅ Tested error boundaries  
✅ Mocked external dependencies  
✅ Used `waitFor` for async operations  
✅ Tested optimistic UI updates  
✅ Verified rollback scenarios

## Quick Troubleshooting

### Tests not running?

- Check that vitest is installed: `npm install`
- Verify test files match pattern: `*.test.ts` or `*.test.tsx`

### Mock not working?

- Ensure mocks are at top level (not inside describe/it blocks)
- Clear mocks in `beforeEach`: `vi.clearAllMocks()`

### Async test timeout?

- Increase timeout: `{ timeout: 10000 }` in test config
- Use `waitFor` for async state changes

### Type errors in mocks?

- Cast mocks: `as unknown as TypeName`
- Use proper return types in mock implementations

---

_Quick Reference - October 29, 2025_
