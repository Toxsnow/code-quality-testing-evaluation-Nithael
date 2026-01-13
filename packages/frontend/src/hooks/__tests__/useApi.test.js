import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';

import { useApi } from '../useApi';

jest.mock('axios');

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with loading false and no error', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should provide request method', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.request).toBeDefined();
    expect(typeof result.current.request).toBe('function');
  });

  it('should provide HTTP methods (get, post, put, delete)', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.get).toBeDefined();
    expect(result.current.post).toBeDefined();
    expect(result.current.put).toBeDefined();
    expect(result.current.delete).toBeDefined();
  });

  it('should set loading to true during request', async () => {
    axios.request.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useApi());

    result.current.get('/test');

    expect(result.current.loading).toBe(true);
  });

  it('should handle successful GET request', async () => {
    const mockData = { data: 'test data' };
    axios.request.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());

    const response = await result.current.get('/test');

    expect(response).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle POST request with data', async () => {
    const mockData = { id: 1, name: 'test' };
    axios.request.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());

    const requestData = { name: 'test' };
    const response = await result.current.post('/test', requestData);

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/test',
        data: requestData
      })
    );
    expect(response).toEqual(mockData);
  });

  it('should handle PUT request', async () => {
    const mockData = { id: 1, name: 'updated' };
    axios.request.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());

    const requestData = { name: 'updated' };
    const response = await result.current.put('/test/1', requestData);

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        url: '/test/1',
        data: requestData
      })
    );
    expect(response).toEqual(mockData);
  });

  it('should handle DELETE request', async () => {
    const mockData = { success: true };
    axios.request.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());

    const response = await result.current.delete('/test/1');

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/test/1'
      })
    );
    expect(response).toEqual(mockData);
  });

  it('should include Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token');
    axios.request.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useApi());

    await result.current.get('/test');

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token'
        }
      })
    );
  });

  it('should not include Authorization header when no token', async () => {
    axios.request.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useApi());

    await result.current.get('/test');

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {}
      })
    );
  });

  it('should handle request error with error message', async () => {
    const errorMessage = 'Request failed';
    axios.request.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    const { result } = renderHook(() => useApi());

    await expect(result.current.get('/test')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle request error without response data', async () => {
    axios.request.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApi());

    await expect(result.current.get('/test')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should reset error on new successful request', async () => {
    axios.request.mockRejectedValueOnce(new Error('First error')).mockResolvedValueOnce({ data: 'success' });

    const { result } = renderHook(() => useApi());

    await expect(result.current.get('/test1')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('First error');
    });

    await result.current.get('/test2');

    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });
});
