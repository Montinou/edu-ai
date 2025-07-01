const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTIyMjUsImV4cCI6MjA2Mzk2ODIyNX0.T5qpZ_aDtliO3g9f4Com6fERFVQyas6BzJgde60ggH4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixCards() {
  console.log('🔍 Checking cards for null values...');
  
  try {
    // Fetch all cards
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('❌ Error fetching cards:', error);
      return;
    }
    
    console.log(`📊 Found ${cards.length} active cards`);
    
    // Check for null values
    const cardsWithNullRarity = cards.filter(card => !card.rarity);
    const cardsWithNullCategory = cards.filter(card => !card.category);
    const cardsWithNullProblemType = cards.filter(card => !card.problem_type_id);
    
    console.log('\n📋 Card Data Analysis:');
    console.log(`Cards with null rarity: ${cardsWithNullRarity.length}`);
    console.log(`Cards with null category: ${cardsWithNullCategory.length}`);
    console.log(`Cards with null problem_type_id: ${cardsWithNullProblemType.length}`);
    
    if (cardsWithNullRarity.length > 0) {
      console.log('\n🔧 Fixing null rarity values...');
      for (const card of cardsWithNullRarity) {
        console.log(`   Fixing card: ${card.name} (ID: ${card.id})`);
        
        // Assign rarity based on attack power
        let rarity = 'common';
        if (card.attack_power >= 60) rarity = 'legendary';
        else if (card.attack_power >= 45) rarity = 'epic';
        else if (card.attack_power >= 30) rarity = 'rare';
        
        const { error: updateError } = await supabase
          .from('cards')
          .update({ rarity })
          .eq('id', card.id);
        
        if (updateError) {
          console.error(`   ❌ Error updating card ${card.id}:`, updateError);
        } else {
          console.log(`   ✅ Updated ${card.name} to ${rarity} rarity`);
        }
      }
    }
    
    if (cardsWithNullCategory.length > 0) {
      console.log('\n🔧 Fixing null category values...');
      for (const card of cardsWithNullCategory) {
        console.log(`   Fixing card: ${card.name} (ID: ${card.id})`);
        
        // Default to arithmetic for now
        const { error: updateError } = await supabase
          .from('cards')
          .update({ category: 'arithmetic' })
          .eq('id', card.id);
        
        if (updateError) {
          console.error(`   ❌ Error updating card ${card.id}:`, updateError);
        } else {
          console.log(`   ✅ Updated ${card.name} to arithmetic category`);
        }
      }
    }
    
    if (cardsWithNullProblemType.length > 0) {
      console.log('\n🔧 Fixing null problem_type_id values...');
      for (const card of cardsWithNullProblemType) {
        console.log(`   Fixing card: ${card.name} (ID: ${card.id})`);
        
        // Default to addition (problem_type_id = 1)
        const { error: updateError } = await supabase
          .from('cards')
          .update({ problem_type_id: 1 })
          .eq('id', card.id);
        
        if (updateError) {
          console.error(`   ❌ Error updating card ${card.id}:`, updateError);
        } else {
          console.log(`   ✅ Updated ${card.name} to addition problem type`);
        }
      }
    }
    
    console.log('\n✅ Card data check and fix completed!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkAndFixCards(); 