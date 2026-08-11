import { getApiBaseUrl } from '@/lib/constants';
import { AuthResponse, LoginPayload, SignupPayload, User } from '@/types/auth';

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'Login failed.');
    }
    return res.json();
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'Signup failed.');
    }
    return res.json();
  },

  async getMe(token: string): Promise<User> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user profile.');
    }
    return res.json();
  },

  async getUsers(token: string): Promise<User[]> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/users/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user list.');
    }
    return res.json();
  },
};
