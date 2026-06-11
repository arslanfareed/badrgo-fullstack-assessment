/**
 * Base class for all domain-level failures. Carries the HTTP status the API filter
 * should translate it to, keeping HTTP concerns declarative while the throw sites
 * stay framework-agnostic.
 */
export abstract class DomainException extends Error {
  abstract readonly httpStatus: number;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
