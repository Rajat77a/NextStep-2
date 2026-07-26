import { storage } from './storage';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  decodeToken,
  generateId,
  delay,
} from '@/lib/crypto';
import type { User, AuthResponse, ApiError } from '@/types';

function createApiError(code: number, message: string, field?: string): ApiError {
  return { code, message, field };
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  role: 'parent' | 'teacher' | 'admin';
}): Promise<AuthResponse> {
  await delay(200);

  const users = storage.getUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  if (users.find((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw createApiError(409, 'An account with this email already exists', 'email');
  }

  const passwordHash = await hashPassword(data.password);

  const user: User = {
    id: generateId(),
    email: normalizedEmail,
    passwordHash,
    fullName: data.fullName.trim(),
    role: 'parent',
    schoolId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  };

  users.push(user);
  storage.setUsers(users);

  const token = generateToken(user.id, user.role, user.schoolId);
  storage.setToken(token);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword as Omit<User, 'passwordHash'>,
    token,
  };
}

export const signUp = register;
export const signup = register;

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  await delay(200);

  const users = storage.getUsers();
  const normalizedEmail = data.email.trim().toLowerCase();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw createApiError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(data.password, user.passwordHash);

  if (!valid) {
    throw createApiError(401, 'Invalid email or password');
  }

  if (user.role !== 'parent') {
    throw createApiError(403, 'Only parent accounts can sign in right now.');
  }

  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  storage.setUsers(users);

  const token = generateToken(user.id, user.role, user.schoolId);
  storage.setToken(token);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword as Omit<User, 'passwordHash'>,
    token,
  };
}

export const signIn = login;
export const signin = login;

export function logout(): void {
  storage.clearToken();
}

export const signOut = logout;
export const signout = logout;

export function getCurrentUser(): Omit<User, 'passwordHash'> | null {
  const token = storage.getToken();

  if (!token) return null;

  const payload = decodeToken(token);

  if (!payload) {
    storage.clearToken();
    return null;
  }

  const users = storage.getUsers();
  const user = users.find((item) => item.id === payload.sub);

  if (!user || !user.isActive || user.role !== 'parent') {
    storage.clearToken();
    return null;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword as Omit<User, 'passwordHash'>;
}

export const currentUser = getCurrentUser;
export const getUser = getCurrentUser;

export async function updateProfile(data: {
  fullName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<Omit<User, 'passwordHash'>> {
  await delay(150);

  const currentUserValue = getCurrentUser();

  if (!currentUserValue) {
    throw createApiError(401, 'Not authenticated');
  }

  const users = storage.getUsers();
  const user = users.find((item) => item.id === currentUserValue.id);

  if (!user) {
    throw createApiError(404, 'User not found');
  }

  if (data.email && data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (users.find((item) => item.email.toLowerCase() === normalizedEmail && item.id !== user.id)) {
      throw createApiError(409, 'Email already in use', 'email');
    }

    user.email = normalizedEmail;
  }

  if (data.fullName) {
    user.fullName = data.fullName.trim();
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      throw createApiError(400, 'Current password is required', 'currentPassword');
    }

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);

    if (!valid) {
      throw createApiError(400, 'Current password is incorrect', 'currentPassword');
    }

    user.passwordHash = await hashPassword(data.newPassword);
  }

  user.updatedAt = new Date().toISOString();
  storage.setUsers(users);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword as Omit<User, 'passwordHash'>;
}

export const updateUser = updateProfile;
export const updateAccount = updateProfile;

export function requireAuth(): Omit<User, 'passwordHash'> {
  const user = getCurrentUser();

  if (!user) {
    throw createApiError(401, 'Please sign in to continue');
  }

  return user;
}

export function requireRole(allowedRoles: string[]): Omit<User, 'passwordHash'> {
  const user = requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw createApiError(403, 'You do not have permission to access this resource');
  }

  return user;
}
