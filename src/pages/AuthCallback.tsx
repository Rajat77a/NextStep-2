import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

function parseHashParams(): Record<string, string> | null {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params: Record<string, string> = {};
  for (const part of hash.split('&')) {
    const [key, ...rest] = part.split('=');
    if (key) params[key] = decodeURIComponent(rest.join('='));
  }
  return params.access_token && params.refresh_token ? params : null;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const redirected = useRef(false);
  const hashHandled = useRef(false);

  useEffect(() => {
    if (redirected.current) return;

    if (loading) return;

    if (user) {
      redirected.current = true;
      navigate(`/${user.role}`, { replace: true });
      return;
    }

    const tokens = parseHashParams();
    if (tokens && !hashHandled.current) {
      hashHandled.current = true;
      supabase.auth.setSession({
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
      }).then(() => {
        window.location.hash = '';
      });
      return;
    }

    if (!tokens) {
      redirected.current = true;
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );
}