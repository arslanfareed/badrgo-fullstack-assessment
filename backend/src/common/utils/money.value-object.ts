/**
 * Money value object.
 *
 * FINANCIAL SAFETY: money is held internally as an integer number of minor units
 * (cents) using `bigint`. All arithmetic happens in integer space, so there is no
 * IEEE-754 rounding error. Values cross the wire as decimal strings ("100.50") and
 * persist as NUMERIC(18,2); they are never a JS `number` during calculation.
 */
export class Money {
  private static readonly SCALE = 2; // NUMERIC(18,2)
  private static readonly MINOR_UNIT_FACTOR = 100n; // 10 ** SCALE

  private constructor(private readonly minorUnits: bigint) {}

  /**
   * Parse a decimal string ("100", "100.5", "100.50") into Money. Rejects anything
   * that is not a non-negative decimal with at most 2 fraction digits, so malformed
   * or float-derived input can never enter the balance pipeline.
   */
  static fromDecimalString(value: string): Money {
    const normalized = value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      throw new Error(`Invalid money value: "${value}". Expected a decimal with up to 2 places.`);
    }

    const [whole, fraction = ''] = normalized.split('.');
    const paddedFraction = fraction.padEnd(Money.SCALE, '0');
    const minorUnits = BigInt(whole) * Money.MINOR_UNIT_FACTOR + BigInt(paddedFraction);
    return new Money(minorUnits);
  }

  static zero(): Money {
    return new Money(0n);
  }

  add(other: Money): Money {
    return new Money(this.minorUnits + other.minorUnits);
  }

  subtract(other: Money): Money {
    return new Money(this.minorUnits - other.minorUnits);
  }

  isGreaterThan(other: Money): boolean {
    return this.minorUnits > other.minorUnits;
  }

  isNegative(): boolean {
    return this.minorUnits < 0n;
  }

  isZero(): boolean {
    return this.minorUnits === 0n;
  }

  isPositive(): boolean {
    return this.minorUnits > 0n;
  }

  /** Serialize back to the canonical "x.xx" string used for storage and transport. */
  toDecimalString(): string {
    const negative = this.minorUnits < 0n;
    const absolute = negative ? -this.minorUnits : this.minorUnits;
    const whole = absolute / Money.MINOR_UNIT_FACTOR;
    const fraction = absolute % Money.MINOR_UNIT_FACTOR;
    const sign = negative ? '-' : '';
    return `${sign}${whole.toString()}.${fraction.toString().padStart(Money.SCALE, '0')}`;
  }
}
