'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 36, scale: shouldReduceMotion ? 1 : 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.62,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-shadow hover:border-purple-500/30 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.4)] ${className}`}
    >
      {children}
    </motion.div>
  );
}