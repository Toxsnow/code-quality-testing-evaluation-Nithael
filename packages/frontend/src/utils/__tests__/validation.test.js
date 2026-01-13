import { validateEmail, validatePassword, validateUser, validateProduct } from '../validation';

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should accept valid password', () => {
    const result = validatePassword('ValidPass123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject short password', () => {
    const result = validatePassword('Short1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('lowercase123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain uppercase');
  });

  it('should reject password without lowercase', () => {
    const result = validatePassword('UPPERCASE123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain lowercase');
  });

  it('should reject password without number', () => {
    const result = validatePassword('NoNumbers');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain number');
  });

  it('should return multiple errors', () => {
    const result = validatePassword('short');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('validateUser', () => {
  it('should validate complete user', () => {
    const user = {
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      password: 'ValidPass123'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should require firstname', () => {
    const user = {
      lastname: 'Doe',
      username: 'johndoe',
      password: 'ValidPass123'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(false);
    expect(result.errors.firstname).toBe('First name is required');
  });

  it('should require lastname', () => {
    const user = {
      firstname: 'John',
      username: 'johndoe',
      password: 'ValidPass123'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(false);
    expect(result.errors.lastname).toBe('Last name is required');
  });

  it('should require username', () => {
    const user = {
      firstname: 'John',
      lastname: 'Doe',
      password: 'ValidPass123'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBe('Username is required');
  });

  it('should reject short username', () => {
    const user = {
      firstname: 'John',
      lastname: 'Doe',
      username: 'ab',
      password: 'ValidPass123'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBe('Username too short');
  });

  it('should require password', () => {
    const user = {
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('Password is required');
  });

  it('should validate password strength', () => {
    const user = {
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      password: 'weak'
    };
    const result = validateUser(user);
    expect(result.isValid).toBe(false);
    expect(Array.isArray(result.errors.password)).toBe(true);
  });
});

describe('validateProduct', () => {
  it('should validate complete product', () => {
    const product = {
      name: 'Test Product',
      price: 19.99,
      stock: 10
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should require name', () => {
    const product = {
      price: 19.99,
      stock: 10
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('should reject empty name', () => {
    const product = {
      name: '   ',
      price: 19.99,
      stock: 10
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('should require valid price', () => {
    const product = {
      name: 'Test',
      stock: 10
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBe('Valid price is required');
  });

  it('should reject negative price', () => {
    const product = {
      name: 'Test',
      price: -5,
      stock: 10
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBe('Price must be positive');
  });

  it('should reject invalid price', () => {
    const product = {
      name: 'Test',
      price: 'invalid',
      stock: 10
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBe('Valid price is required');
  });

  it('should require valid stock', () => {
    const product = {
      name: 'Test',
      price: 19.99
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.stock).toContain('Stock must be a number');
  });

  it('should reject negative stock', () => {
    const product = {
      name: 'Test',
      price: 19.99,
      stock: -5
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.stock).toContain('Stock cannot be negative');
  });

  it('should reject invalid stock', () => {
    const product = {
      name: 'Test',
      price: 19.99,
      stock: 'invalid'
    };
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors.stock).toContain('Stock must be a number');
  });
});
