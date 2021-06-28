class HttpException extends Error {
  errors?: Record<string, string>;
  validationErrors?: Record<string, string>;

  constructor(readonly status: number, readonly message: string) {
    super(message);
  }
}

export default HttpException;
