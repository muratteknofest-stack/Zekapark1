# 🧪 Testing Guide - ZEKAPARK BİLSEM Platform

## Test Framework Setup

This project uses **Vitest** for testing with **Testing Library** for React component testing.

### Installation
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom happy-dom
```

### Available Commands

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (development)
npm test

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### 1. Unit Tests (`src/**/*.test.ts`)
Test utility functions, services, and business logic.

**Example**: `src/utils/QuestionQualityChecker.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { validateQuestion } from './QuestionQualityChecker';

describe('validateQuestion', () => {
  it('should pass valid question', () => {
    const question = createMockQuestion();
    const result = validateQuestion(question);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### 2. Component Tests (`src/components/**/*.test.tsx`)
Test React components in isolation.

**Example Template**:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 3. Service Tests (`src/services/**/*.test.ts`)
Test API calls and data operations.

## Mocking Strategy

### Firebase Mocks
```typescript
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));
```

### Google AI Mocks
```typescript
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(),
    })),
  })),
}));
```

### LocalStorage Mocks
```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Utilities | 90% | ✅ Ready |
| Services | 85% | 🔄 In Progress |
| Components | 80% | 🔄 In Progress |
| Contexts | 85% | ⏳ Pending |
| Features | 75% | ⏳ Pending |

## Best Practices

### 1. Test Naming Convention
```typescript
// ✅ Good
it('should return true for valid question');
it('should fail when prompt is missing');
it('should detect duplicate IDs');

// ❌ Bad
it('test 1');
it('works');
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should calculate quality score', () => {
  // Arrange
  const question = createMockQuestion({ /* ... */ });
  
  // Act
  const score = calculateQualityScore(question);
  
  // Assert
  expect(score).toBeGreaterThan(70);
});
```

### 3. Use Descriptive Matchers
```typescript
// ✅ Good
expect(result.isValid).toBe(true);
expect(errors).toContainEqual(expect.objectContaining({ field: 'text' }));
expect(score).toBeLessThan(50);

// ❌ Less Clear
expect(result.isValid).toEqual(true);
```

### 4. Mock External Dependencies
- Always mock Firebase, AI APIs, and external services
- Use `vi.fn()` for spy functionality
- Reset mocks between tests if needed

### 5. Test Edge Cases
```typescript
// Happy path
it('should pass valid question');

// Edge cases
it('should fail when prompt is empty');
it('should fail when options < 4');
it('should handle null/undefined inputs');
it('should detect duplicate IDs');
```

## Continuous Integration

Tests run automatically on:
- `npm run build` - Type checking
- `npm run test:run` - All tests
- `npm run test:coverage` - Coverage report

## Future Improvements

1. **E2E Tests**: Add Playwright/Cypress for end-to-end testing
2. **Visual Regression**: Add Percy/Chromatic for UI testing
3. **Performance Tests**: Add Lighthouse CI for performance monitoring
4. **Accessibility Tests**: Add axe-core for a11y testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Vitest + React Guide](https://vitest.dev/guide/frontend.html)
