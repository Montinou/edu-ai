'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false
  });

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          user: userData.user,
          loading: false,
          authenticated: true
        });
        return true;
      } else {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false
        });
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      });
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          authenticated: true
        });
        router.push('/dashboard');
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'Error al iniciar sesión' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      });
      router.push('/auth/login');
    }
  };

  // Register function
  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    birthDate: string;
    termsAccepted: boolean;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        router.push('/auth/login?message=Registro exitoso, ahora puedes iniciar sesión');
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'Error al crear la cuenta' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  // Redirect to login if not authenticated
  const redirectIfNotAuthenticated = (redirectTo: string = '/auth/login') => {
    if (!authState.loading && !authState.authenticated) {
      router.push(redirectTo);
    }
  };

  // Check auth on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...authState,
    login,
    logout,
    register,
    checkAuth,
    redirectIfNotAuthenticated
  };
} 