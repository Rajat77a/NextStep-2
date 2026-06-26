import { supabase } from '@/lib/supabase';
import type { User, AuthResponse, ApiError } from '@/types';

function createApiError(code: number, message: string, field?: string): ApiError {
  return { code, message, field };
}

function buildProfileFromUser(
  supaUser: import('@supabase/supabase-js').User,
  dbRow?: Record<string, any> | null
): Omit<User, 'passwordHash'> {
  const meta = supaUser.user_metadata ?? {};
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    fullName: dbRow?.full_name ?? meta.full_name ?? meta.name ?? supaUser.email?.split('@')[0] ?? 'User',
    role: (dbRow?.role ?? meta.role ?? 'parent') as 'parent' | 'teacher' | 'admin',
    schoolId: dbRow?.school_id ?? meta.school_id ?? null,
    createdAt: dbRow?.created_at ?? supaUser.created_at ?? new Date().toISOString(),
    updatedAt: dbRow?.updated_at ?? new Date().toISOString(),
    lastLoginAt: dbRow?.last_login_at ?? null,
    isActive: true,
    invitationStatus: (dbRow?.invitation_status ?? 'accepted') as 'pending' | 'accepted',
  };
}

async function fetchProfile(supabaseUserId: string): Promise<Omit<User, 'passwordHash'> | null> {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUserId)
    .maybeSingle();

  return buildProfileFromUser(authUser.user, data);
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw createApiError(400, error.message);
}

// ─── Email OTP ────────────────────────────────────────────────────────────────

export async function sendOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) throw createApiError(400, error.message);
}

export async function verifyOtp(email: string, token: string): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error || !authData.user) {
    throw createApiError(401, error?.message || 'Invalid or expired OTP');
  }

  const profile = await fetchProfile(authData.user.id);
  const user = profile ?? buildProfileFromUser(authData.user);

  return {
    user,
    token: authData.session?.access_token ?? '',
  };
}

// ─── logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── session / current user ───────────────────────────────────────────────────

export async function getCurrentUser(): Promise<Omit<User, 'passwordHash'> | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return fetchProfile(data.session.user.id);
}

// ─── update profile ───────────────────────────────────────────────────────────

export async function updateProfile(data: {
  fullName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  role?: 'parent' | 'teacher' | 'admin';
}): Promise<Omit<User, 'passwordHash'>> {
  const { data: sessionData } = await supabase.auth.getSession();
  const supaUser = sessionData.session?.user;
  if (!supaUser) throw createApiError(401, 'Not authenticated');

  if (data.email || data.newPassword) {
    const updates: { email?: string; password?: string } = {};
    if (data.email) updates.email = data.email;
    if (data.newPassword) updates.password = data.newPassword;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) throw createApiError(400, error.message);
  }

  const profileUpdates: Record<string, unknown> = {};
  if (data.fullName) profileUpdates.full_name = data.fullName;
  if (data.role) profileUpdates.role = data.role;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', supaUser.id);
    if (profileError) throw createApiError(500, profileError.message);
  }

  const profile = await fetchProfile(supaUser.id);
  if (!profile) throw createApiError(500, 'Failed to reload profile');
  return profile;
}

// ─── guards ───────────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<Omit<User, 'passwordHash'>> {
  const user = await getCurrentUser();
  if (!user) throw createApiError(401, 'Please sign in to continue');
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<Omit<User, 'passwordHash'>> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw createApiError(403, 'You do not have permission to access this resource');
  }
  return user;
}
