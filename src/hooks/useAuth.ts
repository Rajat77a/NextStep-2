import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
  resetPasswordForEmail as apiResetPassword,
} from '@/api/auth';
import type { UserRole } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<Omit<import('@/types').User, 'passwordHash'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bootstrap: load current session on mount, then listen for auth changes
  useEffect(() => {
    let mounted = true;

    getCurrentUser().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await getCurrentUser();
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await apiLogin({ email, password });
      setUser(result.user);
      return result.user;
    } catch (e: any) {
      setError(e.message || 'Login failed');
      throw e;
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
      const result = await apiRegister(data);
      setUser(result.user);
      return result.user;
    } catch (e: any) {
      setError(e.message || 'Registration failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
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
      const updated = await apiUpdateProfile(data);
      setUser(updated);
      return updated;
    } catch (e: any) {
      setError(e.message || 'Update failed');
      throw e;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await apiResetPassword(email);
    } catch (e: any) {
      setError(e.message || 'Reset failed');
      throw e;
    }
  }, []);

  return { user, loading, error, login, register, logout, updateUser, resetPassword };
}
