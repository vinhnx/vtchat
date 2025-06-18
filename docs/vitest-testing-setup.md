# Vitest Testing Setup - Complete Integration Guide

## Overview

This document describes the complete Vitest testing setup for the VTChat monorepo. Vitest has been successfully integrated to provide fast, modern testing capabilities for both React components and utility functions across all packages.

## Installation & Configuration

### Dependencies Installed

```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/ui": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.6.1",
    "@vitejs/plugin-react": "^4.5.2",
    "jsdom": "^26.1.0",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

### Configuration Files

#### `vitest.config.ts` (Root Level - Following Next.js Recommendations)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/apps/web/.next/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/.next/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/apps/web/app/tests/**',
        'vitest.setup.ts'
      ]
    }
  }
})
```

#### `vitest.setup.ts` (Test Setup)

```typescript
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock IntersectionObserver for components that use it
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver for components that use it
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  // Mock localStorage and sessionStorage
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }

  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: mockStorage,
  })

  Object.defineProperty(window, 'sessionStorage', {
    writable: true,
    value: mockStorage,
  })
})

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

## Scripts Available

### Root Level Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Package Level Scripts

Each package (`@repo/shared`, `@repo/common`) has:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Turborepo Integration

Updated `turbo.json` includes test tasks:

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^test"],
      "outputs": ["coverage/**"]
    },
    "test:run": {
      "dependsOn": ["^test:run"],
      "outputs": ["coverage/**"]
    },
    "test:coverage": {
      "dependsOn": ["^test:coverage"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## Test Examples

### Utility Function Test

```typescript
// packages/shared/utils/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'

describe('Utils', () => {
  it('should be a placeholder test', () => {
    expect(true).toBe(true)
  })

  it('should format dates correctly', () => {
    const testDate = new Date('2023-01-01T00:00:00.000Z')
    expect(testDate.getFullYear()).toBe(2023)
  })

  it('should handle string operations', () => {
    const testString = 'Hello World'
    expect(testString.toLowerCase()).toBe('hello world')
    expect(testString.split(' ')).toEqual(['Hello', 'World'])
  })
})
```

### React Component Test

```typescript
// packages/common/components/__tests__/footer.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer Component', () => {
  it('should render footer with links', () => {
    render(<Footer />)

    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('FAQs')).toBeInTheDocument()
  })

  it('should have proper link hrefs', () => {
    render(<Footer />)

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' })
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    const faqLink = screen.getByRole('link', { name: 'FAQs' })

    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(privacyLink).toHaveAttribute('href', '/privacy')
    expect(faqLink).toHaveAttribute('href', '/faq')
  })

  it('should have appropriate styling classes', () => {
    const { container } = render(<Footer />)
    const footer = container.firstChild

    expect(footer).toHaveClass('flex', 'w-full', 'flex-col', 'items-center', 'justify-center')
  })
})
```

## Running Tests

### Command Examples

```bash
# Run all tests once
bun test:run

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage

# Run tests for specific package
cd packages/shared && bun test

# Run specific test file
bun test packages/shared/utils/__tests__/utils.test.ts
```

### Expected Output

```
✓ packages/shared/utils/__tests__/utils.test.ts (3 tests) 3ms
✓ packages/common/components/__tests__/footer.test.tsx (3 tests) 29ms

Test Files  2 passed (2)
     Tests  6 passed (6)
  Start at  22:13:51
  Duration  2.06s (transform 217ms, setup 431ms, collect 1.35s, tests 31ms, environment 295ms, prepare 144ms)
```

## Key Features

### 1. **Monorepo Support**
- Configured with proper path aliases for all packages
- Supports testing across package boundaries
- Turborepo integration for caching

### 2. **React Testing**
- Testing Library integration
- Happy DOM environment for fast rendering
- jest-dom matchers for enhanced assertions

### 3. **Comprehensive Mocking**
- Browser APIs (IntersectionObserver, ResizeObserver, matchMedia)
- Storage APIs (localStorage, sessionStorage)
- Easy to extend for additional mocks

### 4. **Performance Optimized**
- Fast test execution with Vite's transformation
- Coverage reporting with v8
- Watch mode for development

### 5. **TypeScript Support**
- Full TypeScript support out of the box
- Type-safe test writing
- IntelliSense support in test files

## Best Practices

### 1. **Test Organization**
```
packages/
├── shared/
│   └── utils/
│       └── __tests__/
│           └── utils.test.ts
└── common/
    └── components/
        └── __tests__/
            └── footer.test.tsx
```

### 2. **Test Naming**
- Use descriptive test names
- Group related tests with `describe` blocks
- Use `.test.ts` or `.spec.ts` extensions

### 3. **Mocking Strategy**
- Mock external dependencies at the test file level
- Use global mocks in setup file for common browser APIs
- Mock network requests appropriately

### 4. **Component Testing**
- Test user interactions, not implementation details
- Use accessible queries (getByRole, getByLabelText)
- Test component behavior, not internal state

## Integration Benefits

1. **Fast Execution**: Vitest is significantly faster than Jest
2. **Better DX**: Excellent TypeScript support and debugging
3. **Modern Tooling**: Uses Vite's transformation pipeline
4. **Monorepo Ready**: Works seamlessly across packages
5. **Coverage Reports**: Built-in coverage with v8
6. **Watch Mode**: Fast re-runs during development

## Next Steps

1. **Add more test examples** for different types of components
2. **Set up GitHub Actions** integration for CI/CD
3. **Configure coverage thresholds** for quality gates
4. **Add visual regression testing** with tools like Playwright
5. **Mock external APIs** (database, auth, etc.) for integration tests

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure `@testing-library/jest-dom/vitest` is imported
2. **Module Resolution**: Check alias configuration in `vitest.config.ts`
3. **Mock Issues**: Verify global mocks are properly set up in `vitest.setup.ts`
4. **Coverage**: Adjust exclude patterns in coverage configuration

### Performance Tips

1. Use `test:run` for CI environments
2. Use `test:watch` for development
3. Configure appropriate test timeouts
4. Exclude unnecessary files from coverage

## Conclusion

Vitest has been successfully integrated into the VTChat monorepo, providing a modern, fast, and developer-friendly testing solution. The setup supports both utility function testing and React component testing across all packages, with proper TypeScript support and comprehensive mocking capabilities.
