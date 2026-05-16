import { describe, it, expect } from 'vitest';
import { normalizeText, normalizeCurrency, NormalizedString } from './normalize';

describe('normalizeText', () => {
  it('should trim and remove extra whitespace', () => {
    expect(normalizeText('  hello   world  ')).toBe('hello world');
  });

  it('should remove control characters', () => {
    const input = 'hello\x00world\x1F';
    expect(normalizeText(input)).toBe('helloworld');
  });

  it('should handle multi-line strings by collapsing to single line', () => {
    expect(normalizeText('line 1\nline 2')).toBe('line 1 line 2');
  });
});

describe('NormalizedString', () => {
  it('should transform and normalize strings via Zod', () => {
    const input = '  hello \x00 world  ';
    expect(NormalizedString.parse(input)).toBe('hello world');
  });
});

describe('normalizeCurrency', () => {
  it('should normalize BRL format', () => {
    expect(normalizeCurrency('R$ 1.250,50')).toBe('1250.50');
  });

  it('should normalize USD format', () => {
    expect(normalizeCurrency('$ 1,250.50')).toBe('1250.50');
  });

  it('should normalize simple comma decimal', () => {
    expect(normalizeCurrency('1250,50')).toBe('1250.50');
  });

  it('should handle values without decimals', () => {
    expect(normalizeCurrency('5.000')).toBe('5000');
  });

  it('should return original if no numbers found', () => {
    expect(normalizeCurrency('nada aqui')).toBe('nada aqui');
  });
});
