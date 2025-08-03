# Testing Framework

This document describes the testing framework setup for the Solar System Visualization project.

## Overview

The project uses [Vitest](https://vitest.dev/) as the testing framework, which provides a fast unit testing experience with features like:

- Jest-compatible API
- ES module support
- TypeScript support
- Coverage reporting
- Watch mode
- UI mode

## Test Structure

Tests are organized in the same directory structure as the source code:

```
src/
├── utils/
│   ├── MathUtils.js
│   └── MathUtils.test.js
├── physics/
│   ├── NBodyIntegrator.js
│   └── NBodyIntegrator.test.js
└── celestial/
    ├── SolarSystem.js
    └── SolarSystem.test.js
```

## Running Tests

### Basic Test Run

To run all tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

To run tests with coverage:

```bash
npm test -- --coverage
```

### Test Runner Script

The project includes a custom test runner script that provides additional functionality:

```bash
# Run all tests with coverage
npm run test:runner

# Run tests with UI
npm run test:runner -- --ui

# Run tests in watch mode
npm run test:runner -- --watch

# Run tests with coverage
npm run test:runner -- --coverage

# Run specific test file
npm run test:runner -- MathUtils

# Run linting
npm run test:runner -- --lint

# Check formatting
npm run test:runner -- --format

# Run all checks (tests, linting, formatting)
npm run check
```

### UI Mode

To run tests with a visual interface:

```bash
npm run test:ui
```

or

```bash
npm run test:runner -- --ui
```

## Writing Tests

### Test File Naming

Test files should be named after the source files they test, with `.test.js` or `.spec.js` extension:

- `MathUtils.js` → `MathUtils.test.js`
- `NBodyIntegrator.js` → `NBodyIntegrator.test.js`

### Test Structure

Tests should be organized using `describe` blocks to group related tests:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { MathUtils } from './MathUtils.js';

describe('MathUtils', () => {
  let mathUtils;

  beforeEach(() => {
    mathUtils = new MathUtils();
  });

  describe('degToRad', () => {
    it('should convert degrees to radians correctly', () => {
      expect(mathUtils.degToRad(180)).toBeCloseTo(Math.PI);
    });
  });
});
```

### Assertions

Use `expect` for assertions:

```javascript
expect(result).toBe(expected);
expect(result).toEqual(expected);
expect(result).toBeCloseTo(expected, precision);
expect(result).toBeGreaterThan(expected);
expect(result).toBeLessThan(expected);
expect(() => func()).toThrow();
```

### Mocking

Use `vi` for mocking:

```javascript
import { vi } from 'vitest';

// Mock a module
vi.mock('./module.js', () => ({
  default: vi.fn()
}));

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockImplementation((x) => x * 2);

// Mock a module in a test
vi.doMock('./module.js', () => ({
  default: vi.fn()
}));
```

## Test Configuration

### Vitest Configuration

The test configuration is defined in `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'src/workers/',
        'dist/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // ... other aliases
    }
  }
});
```

### Test Setup

The test setup file (`test/setup.js`) includes:

- Mocks for Three.js, mathjs, ml-matrix, and lil-gui
- Mock Web Workers
- Mock performance API
- Mock requestAnimationFrame and cancelAnimationFrame
- Setup DOM for tests
- Global test utilities

## Code Coverage

Coverage reports are generated in the `coverage/` directory:

- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format report
- `coverage/coverage-final.json` - JSON report

To view the HTML coverage report:

```bash
npm test -- --coverage
# Then open coverage/index.html in a browser
```

## Best Practices

1. **Test Structure**: Organize tests with clear `describe` blocks
2. **Test Naming**: Use descriptive test names that explain what is being tested
3. **Setup/Teardown**: Use `beforeEach` and `afterEach` for test setup and cleanup
4. **Assertions**: Use specific assertions that clearly indicate expected behavior
5. **Mocking**: Mock external dependencies to isolate the code being tested
6. **Coverage**: Aim for high test coverage, but focus on testing critical functionality
7. **Integration Tests**: Include integration tests for complex interactions between modules

## Troubleshooting

### Common Issues

1. **Module Resolution Issues**: Ensure all path aliases are correctly configured
2. **Mocking Issues**: Check that mocks are properly set up in the test setup file
3. **DOM Issues**: Use the provided DOM setup in `beforeEach` hooks
4. **Async Issues**: Use `async/await` or return promises for async tests

### Debugging Tests

To debug tests:

1. Use `console.log` for simple debugging
2. Use the `--inspect` flag with Node.js for debugging:
   ```bash
   node --inspect-brk node_modules/.bin/vitest run
   ```
3. Use the UI mode for interactive debugging:
   ```bash
   npm run test:ui
   ```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Jest Expect Documentation](https://jestjs.io/docs/expect)
- [Testing Library](https://testing-library.com/)