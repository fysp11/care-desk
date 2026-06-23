export type UserRole = 'admin' | 'user';

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface AuthenticatedRequest {
  readonly headers: {
    readonly authorization?: string | string[] | undefined;
  };
  user?: AuthenticatedUser;
}

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: UserRole;
  readonly iat?: number;
  readonly exp?: number;
}

export interface LoginResponse {
  readonly token: string;
  readonly user: {
    readonly email: string;
    readonly role: UserRole;
  };
}
