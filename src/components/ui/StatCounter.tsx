'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface StatCounterProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}

export default function StatCounter({
  end,
  label,
  suffix = '',
  duration = 2000,
  delay = 0,
}: StatCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
      
      // Delay the start of the animation
      const timeout = setTimeout(() => {
        startTimeRef.current = null;
        
        const animate = (timestamp: number) => {
          if (startTimeRef.current === null) {
            startTimeRef.current = timestamp;
          }
          
          const elapsed = timestamp - startTimeRef.current;
          const progress = Math.min(elapsed / duration, 1);
          const currentCount = Math.floor(progress * end);
          
          setCount(currentCount);
          
          if (progress < 1) {
            animFrameRef.current = requestAnimationFrame(animate);
          }
        };
        
        animFrameRef.current = requestAnimationFrame(animate);
      }, delay);
      
      return () => {
        clearTimeout(timeout);
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }
    
    // Return an empty cleanup function if the condition is not met
    return () => {};
  }, [inView, end, duration, delay, hasAnimated]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="text-center text-white"
    >
      <span className="block text-4xl font-extrabold">{count}{suffix}</span>
      <span className="text-white/80 text-sm">{label}</span>
    </motion.div>
  );
} 