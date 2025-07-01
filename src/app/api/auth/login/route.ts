import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Starting login process...');
    
    const body = await request.json();
    console.log('📝 Login request for email:', body.email);
    
    // Validar datos de entrada
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.issues);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = createServerSupabaseClient();
    
    // Intentar autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email o contraseña incorrectos' 
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      console.log('❌ No user data returned');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de autenticación' 
        },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated with Supabase:', authData.user.email);

    // Obtener información adicional del usuario desde la tabla users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, status, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado en el sistema' 
        },
        { status: 404 }
      );
    }

    // Verificar estado del usuario
    if (userProfile.status !== 'active') {
      console.log('❌ User account is not active:', userProfile.status);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cuenta suspendida o inactiva' 
        },
        { status: 403 }
      );
    }

    // Actualizar last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userProfile.id);

    console.log('✅ Login successful for user:', userProfile.email);

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        emailVerified: userProfile.email_verified,
        status: userProfile.status
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in login:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 