import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PageTransitionContextValue {
  navigateWithTransition: (target: string) => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used within PageTransitionProvider');
  return ctx;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);
  const [overlayUp, setOverlayUp] = useState(false);

  const navigateWithTransition = useCallback((target: string) => {
    if (transitioning) return;
    setTransitioning(true);
    setOverlayUp(true);

    setTimeout(() => {
      if (target.startsWith('/')) {
        navigate(target);
      } else {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      setTimeout(() => {
        setOverlayUp(false);
        setTimeout(() => setTransitioning(false), 500);
      }, 50);
    }, 450);
  }, [navigate, transitioning]);

  return (
    <PageTransitionContext.Provider value={{ navigateWithTransition, isTransitioning: transitioning }}>
      {children}
      {/* Persistent overlay — survives route changes */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black pointer-events-none"
        initial={{ y: '100%' }}
        animate={{ y: overlayUp ? '0%' : '100%' }}
        transition={{ type: 'spring', stiffness: 140, damping: 26, mass: 0.7 }}
      />
    </PageTransitionContext.Provider>
  );
}
