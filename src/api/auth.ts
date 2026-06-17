import { storage } from './storage';
import { hashPassword, verifyPassword, generateToken, decodeToken, generateId, delay } from '@/lib/crypto';
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
  if (users.find(u => u.email === data.email)) {
    throw createApiError(409, 'An account with this email already exists', 'email');
  }

  const passwordHash = await hashPassword(data.password);
  const user: User = {
    id: generateId(),
    email: data.email,
    passwordHash,
    fullName: data.fullName,
    role: data.role,
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
  return { user: userWithoutPassword as Omit<User, 'passwordHash'>, token };
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  await delay(200);

  const users = storage.getUsers();
  const user = users.find(u => u.email === data.email);
  if (!user) {
    throw createApiError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    throw createApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date().toISOString();
  storage.setUsers(users);

  const token = generateToken(user.id, user.role, user.schoolId);
  storage.setToken(token);

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword as Omit<User, 'passwordHash'>, token };
}

export function logout(): void {
  storage.clearToken();
}

export function getCurrentUser(): Omit<User, 'passwordHash'> | null {
  const token = storage.getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) {
    storage.clearToken();
    return null;
  }

  const users = storage.getUsers();
  const user = users.find(u => u.id === payload.sub);
  if (!user || !user.isActive) {
    storage.clearToken();
    return null;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword as Omit<User, 'passwordHash'>;
}

export async function updateProfile(data: {
  fullName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<Omit<User, 'passwordHash'>> {
  await delay(150);

  const currentUser = getCurrentUser();
  if (!currentUser) throw createApiError(401, 'Not authenticated');

  const users = storage.getUsers();
  const user = users.find(u => u.id === currentUser.id);
  if (!user) throw createApiError(404, 'User not found');

  if (data.email && data.email !== user.email) {
    if (users.find(u => u.email === data.email && u.id !== user.id)) {
      throw createApiError(409, 'Email already in use', 'email');
    }
    user.email = data.email;
  }

  if (data.fullName) user.fullName = data.fullName;

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

export function requireAuth(): Omit<User, 'passwordHash'> {
  const user = getCurrentUser();
  if (!user) throw createApiError(401, 'Please sign in to continue');
  return user;
}

export function requireRole(allowedRoles: string[]): Omit<User, 'passwordHash'> {
  const user = requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw createApiError(403, 'You do not have permission to access this resource');
  }
  return user;
}
