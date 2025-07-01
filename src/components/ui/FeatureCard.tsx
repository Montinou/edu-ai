'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      
      <motion.span 
        className="text-5xl mb-6 block"
        animate={isHovered ? { rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.span>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      
      <p className="text-gray-600">
        {description}
      </p>
    </motion.div>
  );
} 