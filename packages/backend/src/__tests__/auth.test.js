const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should pass with valid token', () => {
    const token = jwt.sign({ id: 1 }, 'your-super-secret-key-that-should-not-be-hardcoded');
    req.headers.authorization = `Bearer ${token}`;

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toHaveProperty('id', 1);
  });

  it('should return 401 if no token provided', () => {
    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No token provided'
    });
  });

  it('should return 401 with invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
