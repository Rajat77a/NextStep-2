import { supabase } from '@/lib/supabase';
import type { User, AuthResponse, ApiError } from '@/types';

function createApiError(code: number, message: string, field?: string): ApiError {
  return { code, message, field };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Fetch the profile row for the currently signed-in Supabase user */
async function fetchProfile(supabaseUserId: string): Promise<Omit<User, 'passwordHash'> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUserId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    schoolId: data.school_id ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lastLoginAt: data.last_login_at ?? null,
    isActive: true,
    invitationStatus: data.invitation_status,
  };
}

// ─── register ─────────────────────────────────────────────────────────────────

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  role: 'parent' | 'teacher' | 'admin';
}): Promise<AuthResponse> {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError || !authData.user) {
    throw createApiError(409, signUpError?.message || 'Registration failed', 'email');
  }

  // Insert profile row with role and display name
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email: data.email,
    full_name: data.fullName,
    role: data.role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    throw createApiError(500, profileError.message);
  }

  const profile = await fetchProfile(authData.user.id);
  if (!profile) throw createApiError(500, 'Failed to load profile after registration');

  return {
    user: profile,
    token: authData.session?.access_token ?? '',
  };
}

// ─── login ────────────────────────────────────────────────────────────────────

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error || !authData.user) {
    throw createApiError(401, 'Invalid email or password');
  }

  const profile = await fetchProfile(authData.user.id);
  if (!profile) throw createApiError(404, 'Profile not found — please contact support');

  return {
    user: profile,
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
}): Promise<Omit<User, 'passwordHash'>> {
  const { data: sessionData } = await supabase.auth.getSession();
  const supaUser = sessionData.session?.user;
  if (!supaUser) throw createApiError(401, 'Not authenticated');

  // Update Supabase Auth email / password if requested
  if (data.email || data.newPassword) {
    const updates: { email?: string; password?: string } = {};
    if (data.email) updates.email = data.email;
    if (data.newPassword) updates.password = data.newPassword;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) throw createApiError(400, error.message);
  }

  // Update profile row
  const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.fullName) profileUpdates.full_name = data.fullName;
  if (data.email) profileUpdates.email = data.email;

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', supaUser.id);

  if (profileError) throw createApiError(500, profileError.message);

  const profile = await fetchProfile(supaUser.id);
  if (!profile) throw createApiError(500, 'Failed to reload profile');
  return profile;
}

// ─── password reset ───────────────────────────────────────────────────────────

export async function resetPasswordForEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw createApiError(400, error.message);
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
