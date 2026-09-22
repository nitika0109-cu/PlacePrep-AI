'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.1,
  delayChildren = 0,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : stagger,
            delayChildren: shouldReduceMotion ? 0 : delayChildren,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? 0 : 36,
          scale: shouldReduceMotion ? 1 : 0.9,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: shouldReduceMotion ? 0.2 : 0.62,
            ease: EASE,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
