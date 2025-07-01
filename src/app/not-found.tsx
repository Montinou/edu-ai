'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 animate-gradient-shift flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-float"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-7xl mb-6"
        >
          🧩
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">¡Ups! Página no encontrada</h1>
        
        <p className="text-xl text-white/80 mb-8">
          Parece que esta parte del mapa aún no ha sido descubierta en nuestra aventura educativa.
        </p>
        
        <Link href="/mindcraft" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <span>🏠</span>
          Volver al Inicio
        </Link>
      </motion.div>
    </div>
  );
} 