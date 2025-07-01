'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, Brain, UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message in URL parameters
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      // Remove the message from URL after showing it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Por favor ingresa un email válido');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      // Successful login - redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center mb-6">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 backdrop-blur-sm shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            EduCard AI
          </h1>
          <h2 className="text-2xl font-bold text-white mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-blue-200 text-lg">
            Ingresa a tu cuenta y continúa aprendiendo
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white border-opacity-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white bg-opacity-20"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-100">
                  Recordarme
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div 
                className="bg-green-500 bg-opacity-20 border border-green-400 rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <p className="text-green-200 text-sm">{successMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div 
                className="bg-red-500 bg-opacity-20 border border-red-400 rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-200 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3" />
                  Iniciar sesión
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-blue-200">¿Nuevo en EduCard AI?</span>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="w-full flex justify-center items-center py-4 px-6 border-2 border-white border-opacity-30 rounded-xl text-lg font-medium text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              <span>Crear cuenta nueva</span>
              <Sparkles className="w-4 h-4 ml-2 text-yellow-300" />
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-blue-300 text-sm">
            © 2024 EduCard AI - Aprende jugando con inteligencia artificial
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center items-center mb-6">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 backdrop-blur-sm shadow-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EduCard AI
            </h1>
            <p className="text-blue-200 text-lg">
              Cargando...
            </p>
          </motion.div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 