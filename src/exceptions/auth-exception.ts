export enum AuthErrorType {
  InvalidRequest = 'invalid_request',
  InvalidClient = 'invalid_client',
  InvalidGrant = 'invalid_grant',
  InvalidToken = 'invalid_token',
  UnauthorizedClient = 'unauthorized_client',
  UnsupportedGrantType = 'unsupported_grant_type',
  InvalidScope = 'invalid_scope',
}

export class AuthException extends Error {
  static readonly errorTypeMap: Record<AuthErrorType, number> = {
    [AuthErrorType.InvalidRequest]: 400,
    [AuthErrorType.InvalidClient]: 401,
    [AuthErrorType.InvalidGrant]: 401,
    [AuthErrorType.InvalidToken]: 401,
    [AuthErrorType.UnauthorizedClient]: 401,
    [AuthErrorType.UnsupportedGrantType]: 400,
    [AuthErrorType.InvalidScope]: 401,
  };

  constructor(readonly error: AuthErrorType, readonly error_description?: string) {
    super(`${error}: ${error_description}`);
  }

  getStatus(): number {
    return AuthException.errorTypeMap[this.error];
  }
}
