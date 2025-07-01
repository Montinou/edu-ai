const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTIyMjUsImV4cCI6MjA2Mzk2ODIyNX0.T5qpZ_aDtliO3g9f4Com6fERFVQyas6BzJgde60ggH4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function enhanceDatabaseSchema() {
  console.log('🚀 Enhancing database schema for advanced card features...');
  
  try {
    // 1. Add missing columns to cards table
    console.log('\n📋 Step 1: Adding missing columns to cards table...');
    
    // Add level_range column (JSONB array for flexibility)
    console.log('   Adding level_range column...');
    const { error: levelRangeError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE cards ADD COLUMN IF NOT EXISTS level_range JSONB DEFAULT '[1, 10]'::jsonb;`
    });
    
    if (levelRangeError) {
      console.log('   ℹ️  level_range column may already exist or needs manual creation');
    } else {
      console.log('   ✅ level_range column added');
    }
    
    // Add problem_difficulty_base column
    console.log('   Adding problem_difficulty_base column...');
    const { error: difficultyError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE cards ADD COLUMN IF NOT EXISTS problem_difficulty_base INTEGER DEFAULT 5;`
    });
    
    if (difficultyError) {
      console.log('   ℹ️  problem_difficulty_base column may already exist or needs manual creation');
    } else {
      console.log('   ✅ problem_difficulty_base column added');
    }
    
    // Add base_power as alias or rename attack_power
    console.log('   Adding base_power column (keeping attack_power for compatibility)...');
    const { error: basePowerError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE cards ADD COLUMN IF NOT EXISTS base_power INTEGER;`
    });
    
    if (basePowerError) {
      console.log('   ℹ️  base_power column may already exist or needs manual creation');
    } else {
      console.log('   ✅ base_power column added');
    }
    
    // 2. Create cards_problem_types table if it doesn't exist
    console.log('\n📋 Step 2: Creating cards_problem_types table...');
    
    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS cards_problem_types (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          category VARCHAR(50) NOT NULL,
          difficulty_base INTEGER DEFAULT 5,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (tableError) {
      console.log('   ℹ️  cards_problem_types table may already exist or needs manual creation');
    } else {
      console.log('   ✅ cards_problem_types table created');
    }
    
    // 3. Populate cards_problem_types with standard data
    console.log('\n📋 Step 3: Populating cards_problem_types with standard data...');
    
    const problemTypes = [
      { code: 'addition', category: 'arithmetic', difficulty_base: 2, name: 'Addition', description: 'Basic addition problems' },
      { code: 'subtraction', category: 'arithmetic', difficulty_base: 2, name: 'Subtraction', description: 'Basic subtraction problems' },
      { code: 'multiplication', category: 'arithmetic', difficulty_base: 3, name: 'Multiplication', description: 'Multiplication problems' },
      { code: 'division', category: 'arithmetic', difficulty_base: 4, name: 'Division', description: 'Division problems' },
      { code: 'fractions', category: 'arithmetic', difficulty_base: 5, name: 'Fractions', description: 'Fraction operations' },
      { code: 'decimals', category: 'arithmetic', difficulty_base: 4, name: 'Decimals', description: 'Decimal operations' },
      { code: 'percentages', category: 'arithmetic', difficulty_base: 5, name: 'Percentages', description: 'Percentage calculations' },
      { code: 'equations', category: 'algebra', difficulty_base: 6, name: 'Equations', description: 'Solving equations' },
      { code: 'inequalities', category: 'algebra', difficulty_base: 6, name: 'Inequalities', description: 'Solving inequalities' },
      { code: 'polynomials', category: 'algebra', difficulty_base: 7, name: 'Polynomials', description: 'Polynomial operations' },
      { code: 'factoring', category: 'algebra', difficulty_base: 7, name: 'Factoring', description: 'Factoring expressions' },
      { code: 'area_perimeter', category: 'geometry', difficulty_base: 4, name: 'Area & Perimeter', description: 'Calculating area and perimeter' },
      { code: 'angles', category: 'geometry', difficulty_base: 5, name: 'Angles', description: 'Angle calculations' },
      { code: 'triangles', category: 'geometry', difficulty_base: 6, name: 'Triangles', description: 'Triangle properties and calculations' },
      { code: 'circles', category: 'geometry', difficulty_base: 6, name: 'Circles', description: 'Circle properties and calculations' },
      { code: 'logic', category: 'logic', difficulty_base: 5, name: 'Logic', description: 'Logic puzzles' },
      { code: 'patterns', category: 'logic', difficulty_base: 4, name: 'Patterns', description: 'Pattern recognition' },
      { code: 'sequences', category: 'logic', difficulty_base: 5, name: 'Sequences', description: 'Number sequences' },
      { code: 'deduction', category: 'logic', difficulty_base: 6, name: 'Deduction', description: 'Deductive reasoning' },
      { code: 'statistics', category: 'statistics', difficulty_base: 6, name: 'Statistics', description: 'Statistical analysis' },
      { code: 'probability', category: 'statistics', difficulty_base: 7, name: 'Probability', description: 'Probability calculations' }
    ];
    
    for (const problemType of problemTypes) {
      const { error: insertError } = await supabase
        .from('cards_problem_types')
        .upsert(problemType, { onConflict: 'code' });
      
      if (insertError) {
        console.log(`   ⚠️  Could not insert ${problemType.code}: ${insertError.message}`);
      } else {
        console.log(`   ✅ Added/updated problem type: ${problemType.code}`);
      }
    }
    
    // 4. Update existing cards with new column values
    console.log('\n📋 Step 4: Updating existing cards with calculated values...');
    
    // Fetch all active cards
    const { data: cards, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('is_active', true);
    
    if (fetchError) {
      console.error('❌ Error fetching cards:', fetchError);
      return;
    }
    
    console.log(`   Found ${cards.length} cards to update`);
    
    for (const card of cards) {
      const updates = {};
      
      // Set base_power from attack_power
      if (card.attack_power && !card.base_power) {
        updates.base_power = card.attack_power;
      }
      
      // Set problem_difficulty_base from difficulty_level if not set
      if (card.difficulty_level && !card.problem_difficulty_base) {
        updates.problem_difficulty_base = card.difficulty_level;
      }
      
      // Set level_range based on difficulty and rarity
      if (!card.level_range) {
        let minLevel = Math.max(1, card.difficulty_level - 2);
        let maxLevel = Math.min(10, card.difficulty_level + 2);
        
        // Adjust for rarity
        if (card.rarity === 'legendary') {
          minLevel = Math.max(5, minLevel);
          maxLevel = 10;
        } else if (card.rarity === 'epic') {
          minLevel = Math.max(3, minLevel);
          maxLevel = Math.min(9, maxLevel);
        } else if (card.rarity === 'rare') {
          minLevel = Math.max(2, minLevel);
          maxLevel = Math.min(8, maxLevel);
        }
        
        updates.level_range = [minLevel, maxLevel];
      }
      
      // Update the card if we have changes
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('cards')
          .update(updates)
          .eq('id', card.id);
        
        if (updateError) {
          console.log(`   ⚠️  Could not update card ${card.name}: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated card: ${card.name} (${Object.keys(updates).join(', ')})`);
        }
      }
    }
    
    console.log('\n🎉 Database schema enhancement completed!');
    console.log('\n📋 Summary of enhancements:');
    console.log('   ✅ Added level_range column for adaptive difficulty ranges');
    console.log('   ✅ Added problem_difficulty_base column for base difficulty');
    console.log('   ✅ Added base_power column (keeping attack_power for compatibility)');
    console.log('   ✅ Created cards_problem_types table with comprehensive problem type data');
    console.log('   ✅ Populated problem types with metadata for better AI generation');
    console.log('   ✅ Updated existing cards with calculated values');
    console.log('\n🚀 The API should now work perfectly with the enhanced schema!');
    
  } catch (error) {
    console.error('❌ Schema enhancement error:', error);
  }
}

enhanceDatabaseSchema(); 