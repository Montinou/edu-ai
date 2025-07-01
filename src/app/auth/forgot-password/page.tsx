'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Brain, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email) {
        throw new Error('Por favor ingresa tu correo electrónico');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Por favor ingresa un email válido');
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar el correo');
      }

      setSuccess(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-green-500 bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                <Mail className="w-8 h-8 text-green-300" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Correo enviado!
            </h2>
            <p className="text-blue-200 mb-6">
              Hemos enviado un enlace para restablecer tu contraseña a:
            </p>
            <p className="text-white font-semibold bg-white bg-opacity-10 rounded-lg p-3 mb-6">
              {email}
            </p>
            <p className="text-blue-300 text-sm mb-8">
              Revisa tu bandeja de entrada y spam. El enlace expira en 24 horas.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3 backdrop-blur-sm">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-blue-200">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar enlace
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-300 text-sm">
            © 2024 EduCard AI - Plataforma educativa inteligente
          </p>
        </div>
      </div>
    </div>
  );
} 