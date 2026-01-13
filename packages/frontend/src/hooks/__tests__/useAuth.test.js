import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAuth } from '../useAuth';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../services/api');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

  it('should initialize with null user and loading true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(true);
  });

  it('should load user from localStorage on mount', async () => {
    const mockUser = { id: 1, firstname: 'John', lastname: 'Doe' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should set loading to false when no token exists', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  it('should provide login function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.login).toBeDefined();
    expect(typeof result.current.login).toBe('function');
  });

  it('should provide logout function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.logout).toBeDefined();
    expect(typeof result.current.logout).toBe('function');
  });

  it('should save user and token on login', async () => {
    const mockUser = { id: 1, firstname: 'Jane', lastname: 'Smith' };
    const mockToken = 'new-token';

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.login(mockUser, mockToken);
    });

    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear user and token on logout', async () => {
    const mockUser = { id: 1, firstname: 'John', lastname: 'Doe' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    api.logout = jest.fn();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      result.current.logout();
    });

    expect(localStorage.getItem('user')).toBe(null);
    expect(localStorage.getItem('token')).toBe(null);
    expect(result.current.user).toBe(null);
    expect(api.logout).toHaveBeenCalled();
  });

  it('should navigate to login on logout', async () => {
    const mockUser = { id: 1, firstname: 'John', lastname: 'Doe' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    api.logout = jest.fn();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      result.current.logout();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle invalid JSON in localStorage gracefully', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', 'invalid-json');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
