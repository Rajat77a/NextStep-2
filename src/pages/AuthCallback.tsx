import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (handled.current) return;
      if (session?.user) {
        handled.current = true;
        const role = session.user.user_metadata?.role ?? 'parent';
        navigate(`/${role}`, { replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (handled.current) return;
      if (session?.user) {
        handled.current = true;
        subscription.unsubscribe();
        const role = session.user.user_metadata?.role ?? 'parent';
        navigate(`/${role}`, { replace: true });
      }
    });

    const timeout = setTimeout(() => {
      if (!handled.current) {
        handled.current = true;
        subscription.unsubscribe();
        navigate('/login', { replace: true });
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );
}