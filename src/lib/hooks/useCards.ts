import { useState, useCallback } from 'react';
import { databaseService } from '@/lib/services/databaseService';
import type { Card } from '@/types/cards';

interface UseCardsReturn {
  cards: Card[];
  loading: boolean;
  error: string | null;
  loadCards: (limit?: number) => Promise<void>;
  reloadCards: (limit?: number) => Promise<void>;
}

/**
 * Custom hook for loading and managing cards from the database
 * @param initialLimit - Initial number of cards to load (default: 3)
 * @returns Object with cards, loading state, error state, and load functions
 */
export function useCards(initialLimit: number = 3): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async (limit: number = initialLimit) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Loading ${limit} cards from database...`);
      
      // Try database service first
      let dbCards: any[] = [];
      try {
        dbCards = await databaseService.apiGetCards(limit);
        console.log(`✅ Loaded ${dbCards.length} cards from database service (limit: ${limit})`);
      } catch (serviceError) {
        console.warn('⚠️ Database service failed, trying API endpoint:', serviceError);
        
        // Fallback to API endpoint
        const response = await fetch(`/api/cards?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.cards) {
          dbCards = data.cards;
          console.log(`✅ Loaded ${dbCards.length} cards from API endpoint (limit: ${limit})`);
        } else {
          throw new Error('No cards found in API response');
        }
      }
      
      if (dbCards && dbCards.length > 0) {
        // Map database cards to expected format
        const mappedCards: Card[] = dbCards.map(dbCard => ({
          id: dbCard.id,
          name: dbCard.name,
          type: dbCard.type || 'math',
          rarity: dbCard.rarity || 'común',
          description: dbCard.description || 'Carta educativa',
          power: dbCard.power || 20,
          cost: dbCard.cost || 2,
          problem: dbCard.problem || {
            question: '¿Cuánto es 2 + 2?',
            answer: 4,
            options: [3, 4, 5, 6],
            operation: 'addition',
            difficulty: 1,
            hints: ['Suma básica'],
            explanation: '2 + 2 = 4',
            type: 'math',
            timeLimit: 30,
          },
          effects: dbCard.effects || [],
          artwork: dbCard.artwork || {
            image: '/images/cards/card-images/placeholder.svg',
          },
          unlocked: true,
          image_url: dbCard.image_url,
        }));
        
        console.log(`✅ Successfully mapped ${mappedCards.length} cards:`, 
          mappedCards.map(c => ({ id: c.id, name: c.name, image_url: c.image_url })));
        
        setCards(mappedCards);
      } else {
        console.warn('⚠️ No cards returned from database');
        setError('No se encontraron cartas en la base de datos');
      }
      
    } catch (err) {
      console.error('❌ Error loading cards:', err);
      setError(`Error al cargar cartas: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  const reloadCards = useCallback(async (limit: number = initialLimit) => {
    await loadCards(limit);
  }, [loadCards, initialLimit]);

  return {
    cards,
    loading,
    error,
    loadCards,
    reloadCards,
  };
} 