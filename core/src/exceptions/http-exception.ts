export class HttpException extends Error {
  errors?: Record<string, string>;
  validationErrors?: Record<string, string>;

  constructor(readonly status: number, readonly message: string = '') {
    super(message);
  }

  withValidationError<T>(validationErrors?: Partial<Record<keyof T, string>>): this {
    this.validationErrors = validationErrors as Record<string, string>;
    return this;
  }
}

export default HttpException;
