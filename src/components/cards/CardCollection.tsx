'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, DatabaseCard } from './Card';
import { SearchIcon } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CardCollectionProps {
  showSearch?: boolean;
  showFilters?: boolean;
  cardSize?: 'small' | 'medium' | 'large';
  maxCards?: number;
  onCardClick?: (card: DatabaseCard) => void;
  className?: string;
}

type SortOption = 'name' | 'rarity' | 'cost' | 'attack' | 'defense' | 'type';
type FilterOption = 'all' | 'attack' | 'defense' | 'special' | 'support';
type RarityFilter = 'all' | 'común' | 'raro' | 'épico' | 'legendario';

export function CardCollection({ 
  showSearch = true, 
  showFilters = true, 
  cardSize = 'medium', 
  maxCards,
  onCardClick,
  className = ''
}: CardCollectionProps) {
  const [cards, setCards] = useState<DatabaseCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<DatabaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterOption>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('rarity');

  // Fetch cards from database
  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        setCards(data || []);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch cards');
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...cards];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.problem_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(card => card.type === typeFilter);
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(card => card.rarity === rarityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { común: 1, raro: 2, épico: 3, legendario: 4 };
          return (rarityOrder as any)[b.rarity] - (rarityOrder as any)[a.rarity];
        case 'cost':
          return a.cost - b.cost;
        case 'attack':
          return b.attack_power - a.attack_power;
        case 'defense':
          return b.defense_power - a.defense_power;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    // Apply max cards limit
    if (maxCards) {
      filtered = filtered.slice(0, maxCards);
    }

    setFilteredCards(filtered);
  }, [cards, searchTerm, typeFilter, rarityFilter, sortBy, maxCards]);

  const handleCardClick = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card && onCardClick) {
      onCardClick(card);
    } else {
      setSelectedCard(selectedCard === cardId ? null : cardId);
    }
  };

  const handleCardHover = (cardId: string) => {
    setHoveredCard(cardId);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-center items-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">Cargando cartas mágicas...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar cartas</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🃏</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cartas disponibles</h3>
          <p className="text-gray-600">Las cartas aparecerán aquí cuando estén listas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Collection Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            🎴 Colección de Cartas ({filteredCards.length}/{cards.length})
          </h2>
          <div className="text-sm text-gray-600">
            ✨ Academia Mágica EduCard
          </div>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="space-y-4">
            {/* Search Bar */}
            {showSearch && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cartas por nombre o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-4">
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="attack">⚔️ Ataque</option>
                  <option value="defense">🛡️ Defensa</option>
                  <option value="special">✨ Especial</option>
                  <option value="support">🌟 Apoyo</option>
                </select>

                {/* Rarity Filter */}
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value as RarityFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las rarezas</option>
                  <option value="común">🌿 Común</option>
                  <option value="raro">💎 Rara</option>
                  <option value="épico">⚡ Épica</option>
                  <option value="legendario">👑 Legendaria</option>
                </select>

                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rarity">Ordenar por rareza</option>
                  <option value="name">Ordenar por nombre</option>
                  <option value="cost">Ordenar por coste</option>
                  <option value="attack">Ordenar por ataque</option>
                  <option value="defense">Ordenar por defensa</option>
                  <option value="type">Ordenar por tipo</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron cartas</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className={`
          grid gap-4 justify-items-center
          ${cardSize === 'small' ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8' : ''}
          ${cardSize === 'medium' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : ''}
          ${cardSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : ''}
        `}>
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              size={cardSize}
              isHovered={hoveredCard === card.id}
              isSelected={selectedCard === card.id}
              showDetails={selectedCard === card.id}
              onClick={() => handleCardClick(card.id)}
              onHover={() => handleCardHover(card.id)}
            />
          ))}
        </div>
      )}

      {/* Collection Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['común', 'raro', 'épico', 'legendario'] as const).map((rarity) => {
          const count = cards.filter(card => card.rarity === rarity).length;
          const config = {
            común: { icon: '🌿', name: 'Comunes', color: 'text-emerald-600' },
            raro: { icon: '💎', name: 'Raras', color: 'text-blue-600' },
            épico: { icon: '⚡', name: 'Épicas', color: 'text-purple-600' },
            legendario: { icon: '👑', name: 'Legendarias', color: 'text-amber-600' }
          };
          
          return (
            <div key={rarity} className="text-center p-3 bg-white rounded-lg shadow">
              <div className="text-2xl mb-1">{config[rarity].icon}</div>
              <div className={`font-bold ${config[rarity].color}`}>{count}</div>
              <div className="text-sm text-gray-600">{config[rarity].name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 