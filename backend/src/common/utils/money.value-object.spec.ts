import { Money } from './money.value-object';

describe('Money', () => {
  describe('parsing', () => {
    it('parses whole and fractional decimal strings', () => {
      expect(Money.fromDecimalString('100').toDecimalString()).toBe('100.00');
      expect(Money.fromDecimalString('100.5').toDecimalString()).toBe('100.50');
      expect(Money.fromDecimalString('100.50').toDecimalString()).toBe('100.50');
    });

    it('rejects floats with more than two decimals and non-numeric input', () => {
      expect(() => Money.fromDecimalString('100.555')).toThrow();
      expect(() => Money.fromDecimalString('abc')).toThrow();
      expect(() => Money.fromDecimalString('-5')).toThrow();
      expect(() => Money.fromDecimalString('')).toThrow();
    });
  });

  describe('arithmetic without floating-point drift', () => {
    it('adds amounts exactly (0.1 + 0.2 === 0.30)', () => {
      const result = Money.fromDecimalString('0.10').add(Money.fromDecimalString('0.20'));
      // The classic IEEE-754 trap: 0.1 + 0.2 === 0.30000000000000004 as floats.
      expect(result.toDecimalString()).toBe('0.30');
    });

    it('subtracts amounts exactly', () => {
      const result = Money.fromDecimalString('1250.00').subtract(Money.fromDecimalString('300.50'));
      expect(result.toDecimalString()).toBe('949.50');
    });

    it('handles large values within NUMERIC(18,2)', () => {
      const result = Money.fromDecimalString('9999999999999999.99').add(
        Money.fromDecimalString('0.01'),
      );
      expect(result.toDecimalString()).toBe('10000000000000000.00');
    });
  });

  describe('comparison', () => {
    it('detects negative results of a subtraction', () => {
      expect(Money.fromDecimalString('100').subtract(Money.fromDecimalString('150')).isNegative()).toBe(
        true,
      );
      expect(Money.fromDecimalString('150').subtract(Money.fromDecimalString('100')).isNegative()).toBe(
        false,
      );
    });

    it('reports zero and positivity', () => {
      expect(Money.zero().isZero()).toBe(true);
      expect(Money.fromDecimalString('0.01').isPositive()).toBe(true);
    });
  });
});
