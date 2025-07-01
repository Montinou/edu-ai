// Check Database Setup - Verify tables exist before generating cards
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 EduCard AI - Database Setup Checker\n');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const REQUIRED_TABLES = [
  'users',
  'cards', 
  'user_cards',
  'player_progress',
  'game_sessions',
  'problem_results',
  'achievements',
  'user_achievements',
  'ai_generated_content'
];

async function checkDatabaseSetup() {
  console.log('🧪 Checking database setup...\n');

  // Test basic connection
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('count')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('❌ Database tables do not exist!');
      console.log('\n📋 REQUIRED SETUP STEPS:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Click "SQL Editor" in the left sidebar');
      console.log('3. Click "New Query"');
      console.log('4. Copy the contents of "database-migration.sql"');
      console.log('5. Paste it into the SQL Editor');
      console.log('6. Click "Run" to create all tables');
      console.log('\n🎯 After setup, run: node scripts/generate-cards.js');
      return false;
    }

    if (error) {
      console.log('❌ Database connection error:', error.message);
      return false;
    }

    console.log('✅ Database tables exist!');
    
    // Check each table
    for (const table of REQUIRED_TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Error with table "${table}":`, error.message);
        } else {
          console.log(`✅ Table "${table}" is ready`);
        }
      } catch (err) {
        console.log(`❌ Table "${table}" check failed:`, err.message);
      }
    }

    // Check if cards already exist
    const { data: existingCards, error: cardError } = await supabase
      .from('cards')
      .select('name')
      .limit(10);

    if (cardError) {
      console.log('❌ Error checking existing cards:', cardError.message);
    } else {
      console.log(`\n📊 Current cards in database: ${existingCards.length}`);
      if (existingCards.length > 0) {
        console.log('🃏 Existing cards:');
        existingCards.forEach(card => {
          console.log(`   - ${card.name}`);
        });
      }
    }

    console.log('\n🚀 Database is ready for card generation!');
    console.log('📝 Next step: node scripts/generate-cards.js');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

// Run the check
if (require.main === module) {
  checkDatabaseSetup().catch(console.error);
}

module.exports = { checkDatabaseSetup }; 