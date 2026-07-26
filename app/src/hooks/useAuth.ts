import { useState, useEffect, useCallback } from 'react';
import * as authApi from '@/api/auth';
import { seedDatabase } from '@/api/seed';
import type { User, UserRole } from '@/types';

type SafeUser = Omit<User, 'passwordHash'>;

function getAuthFunction(nameOptions: string[]) {
  for (const name of nameOptions) {
    const fn = (authApi as any)[name];
    if (typeof fn === 'function') return fn;
  }

  return null;
}

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        if (typeof seedDatabase === 'function') {
          await seedDatabase();
        }

        const getCurrentUser =
          getAuthFunction(['getCurrentUser', 'currentUser', 'getUser']);

        if (getCurrentUser) {
          const currentUser = await getCurrentUser();
          setUser(currentUser || null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const loginFunction = getAuthFunction(['login', 'signIn', 'signin']);

      if (!loginFunction) {
        throw new Error('Login function is missing in src/api/auth.ts');
      }

      const result = await loginFunction({ email, password });
      const loggedInUser = result?.user || result;

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }) => {
    setError(null);
    setLoading(true);

    try {
      const registerFunction = getAuthFunction([
        'register',
        'signUp',
        'signup',
        'createAccount',
      ]);

      if (!registerFunction) {
        throw new Error('Signup function is missing in src/api/auth.ts');
      }

      const result = await registerFunction(data);
      const createdUser = result?.user || result;

      setUser(createdUser);
      return createdUser;
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const logoutFunction = getAuthFunction(['logout', 'signOut', 'signout']);

    if (logoutFunction) {
      logoutFunction();
    }

    setUser(null);
    window.location.href = '/';
  }, []);

  const updateUser = useCallback(async (data: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    setError(null);

    try {
      const updateProfileFunction = getAuthFunction([
        'updateProfile',
        'updateUser',
        'updateAccount',
      ]);

      if (!updateProfileFunction) {
        throw new Error('Update profile function is missing in src/api/auth.ts');
      }

      const updatedUser = await updateProfileFunction(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err?.message || 'Update failed');
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    signUp: register,
    signup: register,
    logout,
    updateUser,
  };
}
