import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(_request: NextRequest) {
  try {
    console.log('🚪 Logging out user...');
    
    const supabase = createServerSupabaseClient();
    
    // Sign out from Supabase auth
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.log('❌ Logout error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Error al cerrar sesión' },
        { status: 500 }
      );
    }

    console.log('✅ User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('💥 Unexpected error in /api/auth/logout:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 