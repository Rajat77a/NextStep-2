import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
  resetPasswordForEmail as apiResetPassword,
} from '@/api/auth';
import type { UserRole } from '@/types';

// Build a minimal user from a Supabase session — never hits the DB.
// Falls back gracefully so login is NEVER blocked by a missing profile row.
function buildUserFromSession(session: import('@supabase/supabase-js').Session): Omit<import('@/types').User, 'passwordHash'> {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    fullName: meta.full_name ?? meta.name ?? session.user.email?.split('@')[0] ?? 'User',
    role: (meta.role ?? 'parent') as 'parent' | 'teacher' | 'admin',
    schoolId: meta.school_id ?? null,
    createdAt: session.user.created_at ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
    isActive: true,
    invitationStatus: 'accepted' as const,
  };
}

export function useAuth() {
  const [user, setUser] = useState<Omit<import('@/types').User, 'passwordHash'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Hard timeout: if Supabase takes > 4s to respond, stop loading.
    // This prevents the spinner from hanging forever on slow/paused projects.
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    // Single source of truth: onAuthStateChange fires immediately with
    // the current session (INITIAL_SESSION event), replacing the need
    // for a separate getCurrentUser() call on mount.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        clearTimeout(timeout);

        if (session) {
          // Build user directly from session metadata — zero extra DB calls.
          // This is instant and never hangs.
          setUser(buildUserFromSession(session));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
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
