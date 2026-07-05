import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
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
  const timers = useRef<number[]>([]);

  const navigateWithTransition = useCallback((target: string) => {
    if (transitioning) return;

    // Clear any pending timers
    timers.current.forEach(id => clearTimeout(id));
    timers.current = [];

    setTransitioning(true);
    setOverlayUp(true);

    // 1) Wait for spring to fully cover the screen (~700ms)
    const t1 = window.setTimeout(() => {
      if (target.startsWith('/')) {
        navigate(target);
      } else {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // 2) Give the new page a frame to render, then reveal
      const t2 = window.setTimeout(() => {
        setOverlayUp(false);

        // 3) Mark transition done after reveal animation finishes
        const t3 = window.setTimeout(() => {
          setTransitioning(false);
        }, 600);
        timers.current.push(t3);
      }, 120);
      timers.current.push(t2);
    }, 700);
    timers.current.push(t1);
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
