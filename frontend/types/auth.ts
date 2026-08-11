export interface User {
  id: number;
  username: string;
  email: string;
  kyber_public_key: string;
  dilithium_public_key: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}
