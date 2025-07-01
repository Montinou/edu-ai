import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/config';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema de validación
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email inválido',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const supabase = createSupabaseServerClient();
    
    // Buscar usuario por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, status')
      .eq('email', email.toLowerCase())
      .single();

    // Siempre devolver éxito por seguridad (no revelar si el email existe)
    if (userError || !user) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, se ha enviado un enlace de recuperación'
      });
    }

    // Verificar que la cuenta esté activa
    if (user.status !== 'active') {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, se ha enviado un enlace de recuperación'
      });
    }

    // Generar token de reseteo
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira en 1 hora

    // Guardar token en la base de datos
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_password_token: resetToken,
        reset_password_expires: resetExpires.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error guardando token de reseteo:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error interno del servidor' 
        },
        { status: 500 }
      );
    }

    // TODO: Aquí normalmente enviarías un email con el token
    // Por ahora, solo loggeamos el token para desarrollo
    console.log(`Token de reseteo para ${email}: ${resetToken}`);
    console.log(`URL de reseteo: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`);

    // Simular un pequeño delay para parecerse al envío de email
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, se ha enviado un enlace de recuperación',
      // En desarrollo, incluir el token para testing
      ...(process.env.NODE_ENV === 'development' && {
        token: resetToken,
        resetUrl: `/auth/reset-password?token=${resetToken}`
      })
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 