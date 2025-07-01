'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl 
      overflow-hidden ${hoverEffect ? 'hover:-translate-y-2 transition-transform' : ''} ${className}`}
    >
      {children}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
    </motion.div>
  );
} 