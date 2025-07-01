import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Get parameters from URL search params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const userIdParam = searchParams.get('user_id');
    const limit = limitParam ? parseInt(limitParam, 10) : 10; // Default to 10 cards
    
    // Validate limit parameter
    const validLimit = Math.max(1, Math.min(limit, 100)); // Between 1 and 100
    
    let cards, error;
    
    if (userIdParam) {
      // Get user's specific cards from user_collection
      console.log(`🔍 Fetching cards for user: ${userIdParam}`);
      
      const { data: userCards, error: collectionError } = await supabase
        .from('user_collection')
        .select('card_id')
        .eq('user_id', userIdParam)
        .order('obtained_at', { ascending: false })
        .limit(validLimit);
      
      if (collectionError) {
        console.error('Error fetching user collection:', collectionError);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch user collection'
        }, { status: 500 });
      }
      
      if (!userCards || userCards.length === 0) {
        console.log(`📭 No cards found for user: ${userIdParam}`);
        return NextResponse.json({
          success: true,
          cards: [],
          count: 0,
          requested_limit: validLimit,
          user_id: userIdParam
        });
      }
      
      // Get the actual card data using the IDs
      const cardIds = userCards.map(uc => uc.card_id);
      
      const { data: userCardData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)
        .eq('is_active', true);
      
      if (cardsError) {
        console.error('Error fetching user cards:', cardsError);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch user cards from database'
        }, { status: 500 });
      }
      
      cards = userCardData;
      
    } else {
      // Original behavior: fetch all active cards
      console.log('🔍 Fetching all active cards');
      
      const { data: allCards, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(validLimit);
      
      cards = allCards;
      error = fetchError;
    }

    if (error) {
      console.error('Error fetching cards:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cards from database'
      }, { status: 500 });
    }

    const response = {
      success: true,
      cards: cards || [],
      count: cards?.length || 0,
      requested_limit: validLimit,
      ...(userIdParam && { user_id: userIdParam })
    };

    console.log(`✅ Successfully fetched ${response.count} cards${userIdParam ? ` for user ${userIdParam}` : ''}`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 