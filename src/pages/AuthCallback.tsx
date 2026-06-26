import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role ?? 'parent';
        navigate(`/${role}`, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );
}