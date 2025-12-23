import { formatPrice, formatStock } from '../utils/formatting';

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
  });

  describe('formatStock', () => {
    it('should format stock correctly', () => {
      expect(formatStock(10)).toContain('10');
      expect(formatStock(0)).toBe('Out of Stock');
    });
  });
});
