import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 Checking user authentication...');
    
    const supabase = createServerSupabaseClient();
    
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (!user) {
      console.log('❌ No user found');
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at, status')
      .eq('email', user.email)
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        displayName: `${userProfile.first_name} ${userProfile.last_name}`,
        status: userProfile.status,
        createdAt: userProfile.created_at
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 