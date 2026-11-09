import { describe, expect, it } from 'vitest';
import { formatAed } from './format';

describe('formatAed', () => {
  it.each([
    [0, 'AED 0.00'],
    [12500, 'AED 12,500.00'],
    [10000000, 'AED 10,000,000.00']
  ])('formats %s as AED with grouping and two decimal places', (value, expected) => {
    expect(formatAed(value)).toBe(expected);
  });
});
