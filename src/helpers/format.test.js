import { describe, expect, it } from 'vitest';
import { formatDate, formatPrice } from './format';

describe('formatPrice', () => {
  it('renders rupiah without decimals', () => {
    const value = formatPrice(12500).replace(/\s/g, ' ');
    expect(value).toBe('Rp 12.500');
  });

  it('renders a fallback for missing or invalid values', () => {
    expect(formatPrice(null)).toBe('-');
    expect(formatPrice('nope')).toBe('-');
  });
});

describe('formatDate', () => {
  it('renders dd MMM yyyy in Indonesian', () => {
    expect(formatDate('2026-10-23T10:00:00Z')).toBe('23 Okt 2026');
  });

  it('renders a fallback for invalid dates', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('not-a-date')).toBe('-');
  });
});
