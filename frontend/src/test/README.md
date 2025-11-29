# Frontend Testing Setup - Vé xe nhanh

## Overview

This directory contains testing configuration for the Vé xe nhanh frontend. The testing framework uses **Vitest** with **React Testing Library**.

## Test Structure

```
frontend/src/
├── test/
│   ├── setup.js                 # Global test configuration
│   └── README.md               # This file
├── store/__tests__/
│   └── authStore.test.js       # Auth store tests
└── services/__tests__/
    └── (future API tests)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode (default)
```bash
npm run test
```

## Test Configuration

Tests are configured in `vite.config.js`:
- **Environment**: jsdom (simulates browser environment)
- **Setup File**: `./src/test/setup.js`
- **Coverage Provider**: v8
- **Coverage Reporters**: text, json, html

## Writing Tests

### Example: Zustand Store Test

```javascript
import { describe, it, expect, beforeEach, act } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAuthStore from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
    localStorage.clear();
  });

  it('should login user successfully', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { _id: '123', email: 'test@example.com' };
    const mockToken = 'test-token';

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Example: React Component Test

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('should submit form with email and password', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

## Test Environment

The test environment includes:
- **jsdom**: Browser-like environment for React components
- **localStorage** mock: Simulated localStorage
- **window.matchMedia** mock: For responsive components
- **@testing-library/jest-dom**: Custom matchers for assertions

## Best Practices

1. **Test user behavior**, not implementation details
2. **Use semantic queries**: `getByRole`, `getByLabelText`, `getByText`
3. **Avoid testing internal state**: Test what users see and interact with
4. **Mock external dependencies**: API calls, localStorage, etc.
5. **Keep tests simple**: One concept per test
6. **Use descriptive names**: Test names should explain what is being tested

## Test Results Summary

**Frontend Tests (Phase 1.7)**
- Test Files: 1 passed
- Tests: 14 passed
- Focus: Authentication Store (authStore.js)

## Covered Functionality

### authStore Tests
- Initial state
- setUser action
- setToken action
- login action
- logout action
- updateUser action
- setLoading action
- State persistence across instances

## Next Steps

- [ ] Add tests for authentication components (LoginPage, RegisterPage)
- [ ] Add tests for API service layer
- [ ] Add tests for custom hooks
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Increase test coverage to 70%+
