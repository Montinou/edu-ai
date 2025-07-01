'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MindcraftButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'primary' | 'secondary' | 'glass';
  className?: string;
  delay?: number;
}

export default function MindcraftButton({
  children,
  href,
  onClick,
  type = 'primary',
  className = '',
  delay = 0,
}: MindcraftButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 px-6 py-3';
  
  const typeClasses = {
    primary: 'bg-white text-indigo-900 shadow-xl hover:shadow-2xl hover:-translate-y-1',
    secondary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:-translate-y-1',
  };
  
  const buttonContent = (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
    >
      {children}
    </motion.span>
  );
  
  if (href) {
    return (
      <Link href={href}>
        {buttonContent}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} type="button">
      {buttonContent}
    </button>
  );
} 