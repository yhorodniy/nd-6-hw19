export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UserCreateRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ValidationError extends Error {
  statusCode: number;
}

export interface AuthServiceError extends Error {
  statusCode: number;
}
