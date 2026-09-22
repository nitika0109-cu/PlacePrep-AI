'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.62,
  y = 36,
  scale = 0.9,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : y,
        scale: shouldReduceMotion ? 1 : scale,
      }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
