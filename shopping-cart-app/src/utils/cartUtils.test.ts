import { describe, it, expect } from 'vitest';

import {
  type CartItem,
  calculateItemTotal,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  formatCurrency,
  isValidQuantity,
} from './cartUtils';

const makeItem = (price: number, quantity: number): CartItem => ({
  id: 1,
  name: 'Test item',
  price,
  quantity,
});


describe('calculateItemTotal', () => {
  it('should multiply price by quantity', () => {
    expect(calculateItemTotal(makeItem(10, 3))).toBe(30);
  });

  it('should return the price when quantity is 1', () => {
    expect(calculateItemTotal(makeItem(25, 1))).toBe(25);
  });

  it('should handle decimal prices', () => {
    expect(calculateItemTotal(makeItem(0.1, 3))).toBeCloseTo(0.3);
  });

  it('should not change the original item', () => {
    const item = makeItem(10, 2);
    calculateItemTotal(item);
    expect(item).toEqual(makeItem(10, 2));
  });
});

describe('calculateSubtotal', () => {
  it('should return 0 for an empty cart', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('should return the total of a single item', () => {
    expect(calculateSubtotal([makeItem(10, 2)])).toBe(20);
  });

  it('should add up multiple items', () => {
    expect(calculateSubtotal([makeItem(10, 2), makeItem(5, 3)])).toBe(35);
  });
});

describe('calculateDiscount', () => {
  it('should return 0 below $50', () => {
    expect(calculateDiscount(49.99)).toBe(0);
  });

  it('should return 0 for a subtotal of 0', () => {
    expect(calculateDiscount(0)).toBe(0);
  });

  it('should give 5% at exactly $50', () => {
    expect(calculateDiscount(50)).toBeCloseTo(2.5);
  });

  it('should give 5% between $50 and $100', () => {
    expect(calculateDiscount(75)).toBeCloseTo(3.75);
  });

  it('should still give 5% just under $100', () => {
    expect(calculateDiscount(99.99)).toBeCloseTo(4.9995);
  });

  it('should give 10% at exactly $100', () => {
    expect(calculateDiscount(100)).toBeCloseTo(10);
  });

  it('should give 10% above $100', () => {
    expect(calculateDiscount(200)).toBeCloseTo(20);
  });
});

describe('calculateTax', () => {
  it('should return 8% of the amount', () => {
    expect(calculateTax(100)).toBeCloseTo(8);
  });

  it('should return 0 for an amount of 0', () => {
    expect(calculateTax(0)).toBe(0);
  });
});

describe('calculateTotal', () => {
  it('should return 0 for an empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should add only tax when there is no discount', () => {
    expect(calculateTotal([makeItem(20, 1)])).toBe(21.6);
  });

  it('should apply the 5% discount tier', () => {
    expect(calculateTotal([makeItem(60, 1)])).toBe(61.56);
  });

  it('should apply the 10% discount tier', () => {
    expect(calculateTotal([makeItem(60, 2)])).toBe(116.64);
  });

  it('should combine multiple items before discounting', () => {
    expect(calculateTotal([makeItem(40, 1), makeItem(30, 2)])).toBe(97.2);
  });

  it('should round the result to 2 decimal places', () => {
    expect(calculateTotal([makeItem(33.33, 1)])).toBe(36);
  });
});

describe('formatCurrency', () => {
  it('should format a whole number with 2 decimals', () => {
    expect(formatCurrency(5)).toBe('$5.00');
  });

  it('should format decimals', () => {
    expect(formatCurrency(19.99)).toBe('$19.99');
  });

  it('should round to 2 decimals', () => {
    expect(formatCurrency(1.999)).toBe('$2.00');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('isValidQuantity', () => {
  it('should accept positive integers', () => {
    expect(isValidQuantity(1)).toBeTruthy();
    expect(isValidQuantity(5)).toBeTruthy();
  });

  it('should reject zero', () => {
    expect(isValidQuantity(0)).toBeFalsy();
  });

  it('should reject negative numbers', () => {
    expect(isValidQuantity(-3)).toBeFalsy();
  });

  it('should reject decimals', () => {
    expect(isValidQuantity(1.5)).toBeFalsy();
  });

  it('should reject NaN', () => {
    expect(isValidQuantity(NaN)).toBeFalsy();
  });
});
