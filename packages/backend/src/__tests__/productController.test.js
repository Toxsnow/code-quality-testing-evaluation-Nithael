const express = require('express');
const request = require('supertest');

const productController = require('../controllers/productController');
const db = require('../db/database');

jest.mock('../db/database');

describe('Product Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/products', productController.getAllProducts);
    app.post('/products', productController.createProduct);
    app.get('/products/:id', productController.getProduct);
    app.patch('/products/:id/stock', productController.updateStock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10, stock: 5 },
        { id: 2, name: 'Product 2', price: 20, stock: 10 }
      ];
      const mockDb = {
        all: jest.fn((query, params, callback) => {
          callback(null, mockProducts);
        }),
        get: jest.fn((query, params, callback) => {
          callback(null, { avg: 15, total: 1 });
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('message', 'success');
    });

    it('should return 400 on database error', async () => {
      const mockDb = {
        all: jest.fn((query, params, callback) => {
          callback(new Error('Database error'));
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).get('/products');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const mockDb = {
        run: jest.fn((query, params, callback) => {
          callback.call({ lastID: 1 }, null);
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).post('/products').send({
        name: 'New Product',
        price: 15,
        stock: 10
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Product');
      expect(response.body).toHaveProperty('price', 15);
      expect(response.body).toHaveProperty('stock', 10);
    });
  });

  describe('getProduct', () => {
    it('should return a single product', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 10, stock: 5 };
      const mockDb = {
        get: jest.fn((query, params, callback) => {
          callback(null, mockProduct);
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).get('/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'success');
    });

    it('should return product with null data if not found', async () => {
      const mockDb = {
        get: jest.fn((query, params, callback) => {
          callback(null, null);
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).get('/products/999');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'success');
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const mockDb = {
        run: jest.fn((query, params, callback) => {
          callback.call({ changes: 1 }, null);
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).patch('/products/1/stock').send({
        stock: 20
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
});
