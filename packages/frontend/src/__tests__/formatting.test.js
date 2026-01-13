import { formatPrice, formatStock, formatDate, formatUserName, formatSearchTerm } from '../utils/formatting';

describe('Formatting Utils', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(10)).toBe('$10.00');
      expect(formatPrice(999.99)).toBe('$999.99');
      expect(formatPrice(1234.56)).toBe('$1,234.56');
    });

    it('should handle invalid input', () => {
      expect(formatPrice('invalid')).toBe('$0.00');
      expect(formatPrice(null)).toBe('$0.00');
      expect(formatPrice(undefined)).toBe('$0.00');
    });

    it('should format large numbers', () => {
      expect(formatPrice(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatStock', () => {
    it('should format stock correctly', () => {
      expect(formatStock(10)).toContain('10');
      expect(formatStock(0)).toBe('Out of Stock');
    });

    it('should show out of stock for 0', () => {
      expect(formatStock(0)).toBe('Out of Stock');
    });

    it('should show low stock for < 5', () => {
      expect(formatStock(1)).toBe('Low Stock (1 left)');
      expect(formatStock(4)).toBe('Low Stock (4 left)');
    });

    it('should show limited stock for 5-9', () => {
      expect(formatStock(5)).toBe('Limited Stock (5 available)');
      expect(formatStock(9)).toBe('Limited Stock (9 available)');
    });

    it('should show in stock for >= 10', () => {
      expect(formatStock(10)).toBe('In Stock (10)');
      expect(formatStock(100)).toBe('In Stock (100)');
    });

    it('should handle invalid stock', () => {
      expect(formatStock('invalid')).toBe('Out of Stock');
      expect(formatStock(null)).toBe('Out of Stock');
      expect(formatStock(undefined)).toBe('Out of Stock');
    });
  });

  describe('formatDate', () => {
    it('should format valid date', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/\d+\/\d+\/\d+/);
    });

    it('should handle null or undefined', () => {
      expect(formatDate(null)).toBe('Invalid Date');
      expect(formatDate(undefined)).toBe('Invalid Date');
    });

    it('should handle invalid date string', () => {
      const result = formatDate('invalid');
      // The function creates a Date which becomes 'NaN/NaN/NaN'
      expect(result).toMatch(/NaN/);
    });

    it('should format ISO date string', () => {
      const result = formatDate('2024-12-25');
      expect(result).toMatch(/\d+\/\d+\/2024/);
    });
  });

  describe('formatUserName', () => {
    it('should format full name', () => {
      expect(formatUserName('john', 'doe')).toBe('John Doe');
    });

    it('should capitalize names', () => {
      // The function capitalizes first letter and keeps rest lowercase
      expect(formatUserName('JOHN', 'DOE')).toBe('John Doe');
    });

    it('should handle only firstname', () => {
      expect(formatUserName('john', '')).toBe('John');
      expect(formatUserName('john', null)).toBe('John');
    });

    it('should handle only lastname', () => {
      expect(formatUserName('', 'doe')).toBe('Doe');
      expect(formatUserName(null, 'doe')).toBe('Doe');
    });

    it('should handle no names', () => {
      expect(formatUserName('', '')).toBe('Unknown User');
      expect(formatUserName(null, null)).toBe('Unknown User');
      expect(formatUserName(undefined, undefined)).toBe('Unknown User');
    });

    it('should trim whitespace', () => {
      expect(formatUserName('  john  ', '  doe  ')).toBe('John Doe');
    });
  });

  describe('formatSearchTerm', () => {
    it('should format search term', () => {
      expect(formatSearchTerm('hello world')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(formatSearchTerm('')).toBe('');
      expect(formatSearchTerm(null)).toBe('');
      expect(formatSearchTerm(undefined)).toBe('');
    });

    it('should capitalize each word', () => {
      expect(formatSearchTerm('search term test')).toBe('Search Term Test');
    });

    it('should handle extra spaces', () => {
      expect(formatSearchTerm('  multiple   spaces  ')).toBe('Multiple Spaces');
    });

    it('should convert to lowercase first', () => {
      expect(formatSearchTerm('UPPERCASE TEXT')).toBe('Uppercase Text');
    });
  });
});
