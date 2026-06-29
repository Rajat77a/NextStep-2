import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function CountUp({ value, suffix = '', duration = 800 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      setCount(value);
      return;
    }
    setCount(0);
    const frames = 48;
    const interval = duration / frames;
    let frame = 0;
    const timer = window.setInterval(() => {
      frame++;
      setCount(Math.round((value / frames) * frame));
      if (frame >= frames) {
        setCount(value);
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, value, shouldReduceMotion, duration]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35 }}
    >{count}{suffix}</motion.span>
  );
}
