import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuthStore from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should mark as unauthenticated when user is null', () => {
      const { result } = renderHook(() => useAuthStore());

      // First set a user
      act(() => {
        result.current.setUser({ _id: '123', email: 'test@example.com' });
      });

      // Then set to null
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setToken', () => {
    it('should set token and store in localStorage', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockToken = 'test-jwt-token';

      act(() => {
        result.current.setToken(mockToken);
      });

      expect(result.current.token).toBe(mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    });

    it('should remove token from localStorage when set to null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setToken('test-token');
      });

      act(() => {
        result.current.setToken(null);
      });

      expect(result.current.token).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('login', () => {
    it('should set user, token, and authentication state', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
      };
      const mockToken = 'test-jwt-token';

      act(() => {
        result.current.login(mockUser, mockToken);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should store user and token in localStorage', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
      };
      const mockToken = 'test-jwt-token';

      act(() => {
        result.current.login(mockUser, mockToken);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('should clear user, token, and authentication state', () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      act(() => {
        result.current.login(
          { _id: '123', email: 'test@example.com' },
          'test-token'
        );
      });

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should remove user and token from localStorage', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(
          { _id: '123', email: 'test@example.com' },
          'test-token'
        );
      });

      act(() => {
        result.current.logout();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('updateUser', () => {
    it('should update user data partially', () => {
      const { result } = renderHook(() => useAuthStore());
      const initialUser = {
        _id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      act(() => {
        result.current.login(initialUser, 'test-token');
      });

      const updates = {
        fullName: 'Updated Name',
        phone: '0901234567',
      };

      act(() => {
        result.current.updateUser(updates);
      });

      expect(result.current.user).toEqual({
        _id: '123',
        email: 'test@example.com',
        fullName: 'Updated Name',
        phone: '0901234567',
      });
    });

    it('should update user in localStorage', () => {
      const { result } = renderHook(() => useAuthStore());
      const initialUser = {
        _id: '123',
        email: 'test@example.com',
      };

      act(() => {
        result.current.login(initialUser, 'test-token');
      });

      const updates = { fullName: 'Updated Name' };

      act(() => {
        result.current.updateUser(updates);
      });

      const expectedUser = { ...initialUser, ...updates };
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(expectedUser)
      );
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist state across store instances', () => {
      const { result: result1 } = renderHook(() => useAuthStore());
      const mockUser = { _id: '123', email: 'test@example.com' };
      const mockToken = 'test-token';

      act(() => {
        result1.current.login(mockUser, mockToken);
      });

      // Create a new instance of the store
      const { result: result2 } = renderHook(() => useAuthStore());

      expect(result2.current.user).toEqual(mockUser);
      expect(result2.current.token).toBe(mockToken);
      expect(result2.current.isAuthenticated).toBe(true);
    });
  });
});
