export interface AdminJwtPayload {
  sub: string;
  type: 'admin';
  permissions: string[];
}

export interface AdminAuthenticatedUser {
  id: string;
  email: string;
  permissions: string[];
}
