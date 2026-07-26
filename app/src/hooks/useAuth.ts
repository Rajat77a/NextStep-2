import { useCallback, useEffect, useState } from 'react';
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
} from '@/api/auth';
import { seedDatabase } from '@/api/seed';
import type { User, UserRole } from '@/types';

type SafeUser = Omit<User, 'passwordHash'>;

function normalizeUser(value: any): SafeUser | null {
  const raw = value?.user || value?.data?.user || value;

  if (!raw) return null;

  const now = new Date().toISOString();

  return {
    id: raw.id || raw.sub || crypto.randomUUID(),
    email: raw.email || '',
    fullName:
      raw.fullName ||
      raw.full_name ||
      raw.name ||
      raw.user_metadata?.fullName ||
      raw.user_metadata?.full_name ||
      raw.user_metadata?.name ||
      'Parent',
    role: (raw.role || raw.user_metadata?.role || 'parent') as UserRole,
    schoolId: raw.schoolId ?? raw.school_id ?? null,
    invitationStatus: raw.invitationStatus || raw.invitation_status,
    createdAt: raw.createdAt || raw.created_at || now,
    updatedAt: raw.updatedAt || raw.updated_at || now,
    lastLoginAt: raw.lastLoginAt || raw.last_login_at || now,
    isActive: raw.isActive ?? raw.is_active ?? true,
  };
}

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(() => {
    try {
      return normalizeUser(getCurrentUser());
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(() => {
    try {
      const currentUser = normalizeUser(getCurrentUser());
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        await seedDatabase();
      } catch {
        // Do not block the app if seed data fails.
      }

      if (active) {
        refreshUser();
        setLoading(false);
      }
    }

    load();

    const handleStorageChange = () => {
      refreshUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await apiLogin({ email, password });
      const nextUser = normalizeUser(result);

      if (!nextUser) {
        throw new Error('Login failed. User data was not returned.');
      }

      setUser(nextUser);
      window.dispatchEvent(new Event('storage'));
      return nextUser;
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
    }) => {
      setError(null);
      setLoading(true);

      try {
        const result = await apiRegister(data);
        const nextUser = normalizeUser(result);

        if (!nextUser) {
          throw new Error('Registration failed. User data was not returned.');
        }

        setUser(nextUser);
        window.dispatchEvent(new Event('storage'));
        return nextUser;
      } catch (err: any) {
        setError(err?.message || 'Registration failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  }, []);

  const updateUser = useCallback(
    async (data: {
      fullName?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      setError(null);

      try {
        const updated = normalizeUser(await apiUpdateProfile(data));

        if (!updated) {
          throw new Error('Update failed. User data was not returned.');
        }

        setUser(updated);
        window.dispatchEvent(new Event('storage'));
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Update failed');
        throw err;
      }
    },
    []
  );

  return {
    user,
    loading,
    error,
    login,
    register,
    signup: register,
    signUp: register,
    logout,
    updateUser,
    refreshUser,
  };
}
