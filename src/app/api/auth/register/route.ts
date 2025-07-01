import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema de validación
const registerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  termsAccepted: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting registration process...');
    
    const body = await request.json();
    console.log('📝 Request body received:', { 
      ...body, 
      password: '[REDACTED]', 
      confirmPassword: '[REDACTED]' 
    });
    
    // Validar datos de entrada
    const validationResult = registerSchema.safeParse(body);
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

    console.log('✅ Validation passed');
    const { firstName, lastName, email, birthDate, password } = validationResult.data;

    const supabase = createServerSupabaseClient();

    // Verificar si el usuario ya existe
    console.log('🔍 Checking if user already exists...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { 
          success: false, 
          error: 'El email ya está registrado' 
        },
        { status: 409 }
      );
    }

    console.log('✅ Email is available');

    // Crear usuario en Supabase Auth
    console.log('👤 Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate
        }
      }
    });

    if (authError) {
      console.log('❌ Auth signup error:', authError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error creando usuario en el sistema de autenticación',
          details: authError.message
        },
        { status: 500 }
      );
    }

    if (!authData.user) {
      console.log('❌ No user data returned from auth signup');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error creando usuario' 
        },
        { status: 500 }
      );
    }

    console.log('✅ User created in Supabase Auth:', authData.user.email);

    // Automatically confirm the user's email for development
    console.log('📧 Confirming user email...');
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.log('⚠️ Warning: Could not confirm email automatically:', confirmError.message);
    } else {
      console.log('✅ User email confirmed automatically');
    }

    // Crear perfil de usuario en la tabla users
    console.log('📊 Creating user profile in database...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          status: 'active',
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('id, email, first_name, last_name')
      .single();

    if (profileError) {
      console.log('❌ Profile creation error:', profileError.message);
      
      // Si falla la creación del perfil, intentar eliminar el usuario de auth
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('🧹 Cleaned up auth user after profile creation failure');
      } catch (cleanupError) {
        console.log('⚠️ Failed to cleanup auth user:', cleanupError);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error creando usuario en la base de datos',
          details: profileError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ User profile created successfully:', userProfile.email);

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 