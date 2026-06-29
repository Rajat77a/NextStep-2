import { type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltDegree?: number;
  liftY?: number;
}

export default function TiltCard({
  children,
  className = '',
  tiltDegree = 6,
  liftY = -4,
}: TiltCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [tiltDegree, -tiltDegree]),
    { stiffness: 300, damping: 30 },
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-tiltDegree, tiltDegree]),
    { stiffness: 300, damping: 30 },
  );
  const liftYValue = useSpring(0, { stiffness: 400, damping: 30 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    liftYValue.set(liftY);
  }

  function handleLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
    liftYValue.set(0);
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ perspective: 800 }}
    >
      <motion.div style={{ rotateX, rotateY, y: liftYValue }}>
        {children}
      </motion.div>
    </div>
  );
}
