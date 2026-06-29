import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SparkleBurstProps {
  delay?: number;
  color?: string;
  count?: number;
}

const PARTICLE_COLORS = ['#E85D3E', '#7A9B8A', '#D4A03A', '#E85D3E', '#7A9B8A'];

export default function SparkleBurst({
  delay = 0,
  color,
  count = 6,
}: SparkleBurstProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(timer);
  }, [delay, prefersReducedMotion]);

  if (!active || prefersReducedMotion) return null;

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 60,
    y: -(Math.random() * 50 + 20),
    size: Math.random() * 3 + 2,
    bg: color || PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    delay: i * 0.06,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 1 }}
          transition={{ duration: 0.7, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.bg,
            top: '50%',
            left: '50%',
          }}
        />
      ))}
    </div>
  );
}
