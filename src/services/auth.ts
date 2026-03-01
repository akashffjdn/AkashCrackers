import api from '@/lib/api.ts';
import type { UserProfile } from '@/types/index.ts';

const TOKENS_KEY = 'akash-crackers-tokens';

interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify({ accessToken, refreshToken }));
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  const result: AuthResponse = await api.post('/auth/login', { email, password });
  storeTokens(result.accessToken, result.refreshToken);
  return result.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  phone?: string,
): Promise<UserProfile> {
  const result: AuthResponse = await api.post('/auth/register', {
    email,
    password,
    displayName,
    phone,
  });
  storeTokens(result.accessToken, result.refreshToken);
  return result.user;
}

export function signInWithGoogle(): void {
  // Save current path so OAuthCallbackPage can redirect back
  const redirectPath = window.location.pathname;
  if (redirectPath !== '/login' && redirectPath !== '/signup') {
    localStorage.setItem('akash-crackers-oauth-redirect', redirectPath);
  }
  // Redirect to backend Google OAuth endpoint
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  window.location.href = `${apiUrl}/auth/google`;
}

export async function resetPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function confirmReset(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password: newPassword });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword });
}

export async function signOutUser(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore errors — clear local state regardless
  }
  localStorage.removeItem(TOKENS_KEY);
}

export async function getMe(): Promise<UserProfile> {
  return api.get('/auth/me');
}
