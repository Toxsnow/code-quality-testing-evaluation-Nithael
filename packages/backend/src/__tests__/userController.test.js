const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');
const db = require('../db/database');

jest.mock('../db/database');

describe('User Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/register', userController.registerUser);
    app.post('/login', userController.loginUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockDb = {
        run: jest.fn((query, params, callback) => {
          callback.call({ lastID: 1 }, null);
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).post('/register').send({
        firstname: 'John',
        lastname: 'Doe',
        password: 'password123',
        username: 'johndoe'
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('auth', true);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 500 on database error', async () => {
      const mockDb = {
        run: jest.fn((query, params, callback) => {
          callback(new Error('Database error'));
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).post('/register').send({
        firstname: 'John',
        lastname: 'Doe',
        password: 'password123',
        username: 'johndoe'
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = bcrypt.hashSync('password123', 8);
      const mockDb = {
        get: jest.fn((query, params, callback) => {
          callback(null, {
            id: 1,
            password: hashedPassword,
            username: 'johndoe'
          });
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).post('/login').send({
        password: 'password123',
        username: 'johndoe'
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('auth', true);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 404 if user not found', async () => {
      const mockDb = {
        get: jest.fn((query, params, callback) => {
          callback(null, null);
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).post('/login').send({
        password: 'password123',
        username: 'johndoe'
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'No user found.');
    });

    it('should return 401 with invalid password', async () => {
      const hashedPassword = bcrypt.hashSync('password123', 8);
      const mockDb = {
        get: jest.fn((query, params, callback) => {
          callback(null, {
            id: 1,
            password: hashedPassword,
            username: 'johndoe'
          });
        })
      };
      db.getDb.mockReturnValue(mockDb);

      const response = await request(app).post('/login').send({
        password: 'wrongpassword',
        username: 'johndoe'
      });

      expect(response.status).toBe(401);
    });
  });
});
