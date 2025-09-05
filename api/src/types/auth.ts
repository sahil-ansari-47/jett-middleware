// types/auth.ts
export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
