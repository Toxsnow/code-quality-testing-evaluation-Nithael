import axios from 'axios';

import * as api from '../api';

jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('loginUser', () => {
    it('should login user and store credentials', async () => {
      const mockResponse = {
        data: {
          auth: true,
          token: 'test-token',
          user: { id: 1, username: 'testuser' }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await api.loginUser('testuser', 'password123');

      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login error with response data', async () => {
      const errorResponse = {
        response: {
          data: { error: 'Invalid credentials' }
        }
      };
      axios.post.mockRejectedValue(errorResponse);

      await expect(api.loginUser('testuser', 'wrong')).rejects.toEqual({
        error: 'Invalid credentials'
      });
    });

    it('should handle network error', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(api.loginUser('testuser', 'password')).rejects.toEqual({
        error: 'Network error'
      });
    });
  });

  describe('registerUser', () => {
    it('should register user and store token', async () => {
      const mockResponse = {
        data: {
          token: 'new-token',
          user: { id: 2, username: 'newuser' }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await api.registerUser({
        username: 'newuser',
        password: 'password123',
        firstname: 'New',
        lastname: 'User'
      });

      expect(localStorage.getItem('token')).toBe('new-token');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUsers', () => {
    it('should fetch users with token', async () => {
      localStorage.setItem('token', 'test-token');
      const mockUsers = [{ id: 1, username: 'user1' }];
      axios.get.mockResolvedValue({ data: mockUsers });

      const result = await api.getUsers();

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/users', {
        headers: { Authorization: 'Bearer test-token' }
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getProducts', () => {
    it('should fetch and process products', async () => {
      localStorage.setItem('token', 'test-token');
      const mockProducts = [{ id: 1, name: 'Product 1', price: 100, stock: 5 }];
      axios.get.mockResolvedValue({ data: { data: mockProducts } });

      const result = await api.getProducts();

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/products', {
        headers: { Authorization: 'Bearer test-token' }
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      localStorage.setItem('token', 'test-token');
      const mockProduct = { id: 1, name: 'New Product', price: 50, stock: 10 };
      axios.post.mockResolvedValue({ data: mockProduct });

      const result = await api.createProduct({
        name: 'New Product',
        price: 50,
        stock: 10
      });

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/products',
        { name: 'New Product', price: 50, stock: 10 },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('logout', () => {
    it('should clear localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      api.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
