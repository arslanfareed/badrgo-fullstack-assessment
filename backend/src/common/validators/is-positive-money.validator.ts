import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Validates that a value is a strictly positive monetary amount expressed as a decimal
 * string with at most two fraction digits. Strings (not numbers) are required so that
 * floating-point representations never enter the money pipeline.
 */
export function IsPositiveMoney(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isPositiveMoney',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !MONEY_PATTERN.test(value.trim())) {
            return false;
          }
          return parseFloat(value) > 0;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a positive decimal string with up to 2 decimal places (e.g. "100.50")`;
        },
      },
    });
  };
}
