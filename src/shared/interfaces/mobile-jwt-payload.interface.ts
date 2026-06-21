export interface MobileJwtPayload {
  sub: string;
  type: 'mobile';
}

export interface MobileAuthenticatedUser {
  id: string;
}
