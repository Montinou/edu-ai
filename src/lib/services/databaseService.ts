// Database service for Supabase operations
import { supabase } from '@/lib/supabase/config';
import type { User, PlayerProgress, UserCard } from '@/types/user';
import type { Card, ProblemResult } from '@/types/cards';
import type { GameSession, BattleResult } from '@/types/game';

export class DatabaseService {
  // User Management
  async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...userData,
      });
    
    if (error) throw error;
  }

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Player Progress Management
  async getPlayerProgress(userId: string): Promise<PlayerProgress | null> {
    const { data, error } = await supabase
      .from('player_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updatePlayerProgress(userId: string, updates: Partial<PlayerProgress>): Promise<void> {
    const { error } = await supabase
      .from('player_progress')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async incrementPlayerStats(userId: string, stats: {
    experience?: number;
    level?: number;
    totalProblemsCompleted?: number;
    correctAnswers?: number;
    totalBattles?: number;
    battlesWon?: number;
  }): Promise<void> {
    // Use the custom function for atomic updates
    const { error } = await supabase.rpc('update_player_stats', {
      p_user_id: userId,
      p_problems_completed: stats.totalProblemsCompleted || 0,
      p_correct_answers: stats.correctAnswers || 0,
      p_battles: stats.totalBattles || 0,
      p_battles_won: stats.battlesWon || 0,
      p_play_time: 0 // Can be added later
    });
    
    if (error) throw error;
  }

  // Card Management - Simple version for BattleField (NO FALLBACKS)
  async getUserCardsForBattle(userId: string): Promise<Card[]> {
    // Step 1: Get card IDs from user collection
    const { data: userCards, error: collectionError } = await supabase
      .from('user_collection')
      .select('card_id')
      .eq('user_id', userId)
      .order('obtained_at', { ascending: false });
    
    if (collectionError) throw collectionError;
    
    if (!userCards || userCards.length === 0) {
      return []; // User has no cards
    }

    // Step 2: Get actual card data using the IDs
    const cardIds = userCards.map(uc => uc.card_id);
    
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('id', cardIds)
      .eq('is_active', true);
    
    if (cardsError) throw cardsError;
    
    // Map attack_power to power for compatibility and add missing fields
    return (cards || []).map(card => ({
      id: card.id,
      name: card.name,
      description: card.description || '',
      type: card.category || 'math',
      rarity: card.rarity || 'common',
      power: card.attack_power || 0,
      cost: card.cost || 1,
      problem: {
        question: '',
        answer: '',
        operation: 'addition',
        difficulty: card.difficulty_level || 1,
        timeLimit: 30,
        hints: [],
        explanation: '',
        type: 'math'
      },
      effects: [],
      artwork: {
        style: 'default',
        background: '#ffffff',
        foreground: '#000000',
        image: ''
      },
      unlocked: true,
      image_url: card.image_url
    })) as Card[];
  }

  async addCardToUser(userId: string, cardData: Omit<UserCard, 'id' | 'user_id' | 'obtained_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('user_cards')
      .insert({
        ...cardData,
        user_id: userId,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  async updateUserCard(cardId: string, updates: Partial<UserCard>): Promise<void> {
    const { error } = await supabase
      .from('user_cards')
      .update(updates)
      .eq('id', cardId);
    
    if (error) throw error;
  }

  // Add specific card to user collection by card ID (NO FALLBACKS)
  async addCardToUserById(userId: string, cardId: string): Promise<void> {
    const { error } = await supabase
      .from('user_collection')
      .insert({
        user_id: userId,
        card_id: cardId,
        quantity: 1,
        level: 1,
        experience: 0,
        times_used: 0,
        is_upgraded: false,
        is_favorite: false
      });
    
    if (error) throw error;
  }

  // Game Session Management
  async createGameSession(sessionData: Omit<GameSession, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert(sessionData)
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  async updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<void> {
    const { error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId);
    
    if (error) throw error;
  }

  async getGameSession(sessionId: string): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Battle Results
  async saveBattleResult(battleData: Omit<BattleResult, 'id' | 'timestamp'>): Promise<string> {
    const { data, error } = await supabase
      .from('battle_results')
      .insert(battleData)
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  async getUserBattleHistory(userId: string, limitCount: number = 10): Promise<BattleResult[]> {
    const { data, error } = await supabase
      .from('battle_results')
      .select('*')
      .eq('player_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limitCount);
    
    if (error) throw error;
    return data || [];
  }

  // Problem Results Tracking
  async saveProblemResult(problemData: Omit<ProblemResult, 'id' | 'timestamp'>): Promise<string> {
    const { data, error } = await supabase
      .from('problem_results')
      .insert(problemData)
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  async getUserProblemHistory(userId: string, limitCount: number = 50): Promise<ProblemResult[]> {
    const { data, error } = await supabase
      .from('problem_results')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limitCount);
    
    if (error) throw error;
    return data || [];
  }

  // Analytics and Leaderboards
  async getLeaderboard(category: string, period: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        *,
        users (
          name,
          avatar_url
        )
      `)
      .eq('category', category)
      .eq('period', period)
      .order('rank', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async getUserAnalytics(userId: string) {
    const { data, error } = await supabase
      .from('analytics_user_performance')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getLearningProgress(userId: string) {
    const { data, error } = await supabase
      .from('analytics_learning_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  // Card Collection
  async getAllCards(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('unlock_level', { ascending: true })
      .order('rarity', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific number of active cards from the database
   * @param limit - Number of cards to retrieve (default: 10, max: 100)
   * @returns Promise<Card[]> - Array of cards from the database
   */
  async apiGetCards(limit: number = 10): Promise<Card[]> {
    // Validate and clamp limit
    const validLimit = Math.max(1, Math.min(limit, 100));
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(validLimit);
    
    if (error) throw error;
    
    // Map attack_power to power for compatibility
    return (data || []).map(card => ({
      ...card,
      power: card.attack_power
    }));
  }

  async getStarterCards(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_starter', true)
      .order('unlock_level', { ascending: true });
    
    if (error) throw error;
    
    // Map attack_power to power for compatibility
    return (data || []).map(card => ({
      ...card,
      power: card.attack_power
    }));
  }

  // AI Integration
  async getCachedAIContent(contentType: string, difficulty?: number, limit: number = 10) {
    let query = supabase
      .from('ai_generated_content')
      .select('*')
      .eq('content_type', contentType)
      .eq('is_validated', true);
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query
      .order('quality_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async saveAIContent(content: {
    content_type: string;
    difficulty?: number;
    parameters: Record<string, unknown>;
    content: Record<string, unknown>;
    ai_service: string;
    quality_score?: number;
  }) {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .insert(content)
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  async savePromptResult(prompt: {
    user_id?: string;
    session_id?: string;
    prompt_text: string;
    expected_result?: string;
    actual_result?: string;
    success_score?: number;
    ai_service: string;
    context?: string;
    feedback?: any;
  }) {
    const { data, error } = await supabase
      .from('ai_prompts')
      .insert(prompt)
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  // Achievements
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          name,
          description,
          icon,
          category,
          rarity,
          xp_reward
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async unlockAchievement(userId: string, achievementId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  // Daily Goals
  async getDailyGoal(userId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateDailyGoal(userId: string, date: string, updates: { completed?: number; is_completed?: boolean }) {
    const { error } = await supabase
      .from('daily_goals')
      .upsert({
        user_id: userId,
        date,
        ...updates
      });
    
    if (error) throw error;
  }

  // Real-time subscriptions
  subscribeToUserProgress(userId: string, callback: (progress: PlayerProgress) => void) {
    return supabase
      .channel('user_progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as PlayerProgress);
        }
      )
      .subscribe();
  }

  subscribeToLeaderboard(category: string, period: string, callback: (data: any[]) => void) {
    return supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboards',
          filter: `category=eq.${category},period=eq.${period}`
        },
        async () => {
          // Refetch leaderboard data
          const leaderboard = await this.getLeaderboard(category, period);
          callback(leaderboard);
        }
      )
      .subscribe();
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 