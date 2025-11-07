---
name: saas-testing-guide
description: Testing guide for SaaS applications including unit tests, integration tests, E2E tests with Playwright, and CI/CD setup
allowed-tools: Read, Write, Edit, Bash
---

# SaaS Testing Guide

Comprehensive testing patterns for Next.js SaaS applications.

## Setup

```bash
# Vitest + React Testing Library
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react

# Playwright for E2E
npm install -D @playwright/test

# Utilities
npm install -D @testing-library/user-event @faker-js/faker
```

## Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
})
```

## Setup File

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

## Component Test

```typescript
// __tests__/components/project-card.test.tsx
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ProjectCard } from '@/components/project-card'

describe('ProjectCard', () => {
  it('renders project information', () => {
    const project = {
      id: '1',
      name: 'Test Project',
      description: 'A test project',
    }

    render(<ProjectCard project={project} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(<ProjectCard project={project} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledWith(project.id)
  })
})
```

## Server Action Test

```typescript
// __tests__/actions/create-project.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createProject } from '@/lib/actions/projects'

describe('createProject', () => {
  beforeEach(async () => {
    // Setup test database
  })

  afterEach(async () => {
    // Cleanup test database
  })

  it('creates a project successfully', async () => {
    const input = {
      name: 'New Project',
      description: 'Description',
      organizationId: 'org-123',
    }

    const result = await createProject(input)

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('New Project')
  })

  it('returns error for invalid input', async () => {
    const input = {
      name: 'A', // Too short
      organizationId: 'org-123',
    }

    const result = await createProject(input)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

## E2E Test (Playwright)

```typescript
// __tests__/e2e/projects.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('creates a new project', async ({ page }) => {
    await page.goto('/org-slug/projects')
    await page.click('text=New Project')

    await page.fill('[name="name"]', 'E2E Test Project')
    await page.fill('[name="description"]', 'Created by E2E test')
    await page.click('button:has-text("Create")')

    await expect(page.locator('text=E2E Test Project')).toBeVisible()
  })

  test('deletes a project', async ({ page }) => {
    await page.goto('/org-slug/projects')

    await page.click('[data-testid="project-menu"]')
    await page.click('text=Delete')
    await page.click('button:has-text("Confirm")')

    await expect(page.locator('text=Project deleted')).toBeVisible()
  })
})
```

## Test Factories

```typescript
// test/factories.ts
import { faker } from '@faker-js/faker'

export function createProject(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    organizationId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createOrganization(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()),
    ownerId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
```

## Mock Supabase Client

```typescript
// __tests__/mocks/supabase.ts
import { vi } from 'vitest'

export function mockSupabaseClient() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' },
          },
        },
      }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  }
}
```

## GitHub Actions CI

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run __tests__/unit",
    "test:integration": "vitest run __tests__/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing Checklist

- [ ] Unit tests for utility functions
- [ ] Component tests for UI components
- [ ] Integration tests for Server Actions
- [ ] API route tests
- [ ] E2E tests for critical user flows
- [ ] Test database setup
- [ ] Mocks for external services
- [ ] CI/CD pipeline configured
- [ ] Coverage >80% for critical paths
- [ ] All tests pass before merge

## Best Practices

**What to Test**:
- ✅ User interactions and workflows
- ✅ Business logic
- ✅ Error handling
- ✅ Edge cases
- ❌ Implementation details
- ❌ Third-party libraries

**Test Structure**:
- Arrange: Set up test data
- Act: Perform action
- Assert: Verify result

**Naming**:
- Describe what, when, expected result
- Example: "creates project when valid data provided"
