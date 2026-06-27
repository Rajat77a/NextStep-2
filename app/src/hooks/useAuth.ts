import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  signInWithGoogle as apiSignInWithGoogle,
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
} from '@/api/auth';

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
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session) {
          setUser(buildUserFromSession(session));
        } else {
          setUser(null);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (session) {
          setUser(buildUserFromSession(session));
          setSessionExpired(false);
        } else {
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            setSessionExpired(true);
          }
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

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await apiSignInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed');
    }
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      await apiSendOtp(email);
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await apiVerifyOtp(email, token);
      setUser(result.user);
      return result.user;
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    role?: 'parent' | 'teacher' | 'admin';
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

  return { user, loading, error, sessionExpired, signInWithGoogle, sendOtp, verifyOtp, logout, updateUser };
}
