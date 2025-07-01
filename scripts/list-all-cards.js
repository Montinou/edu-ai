const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('id, name, problem_type_id')
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`📋 All ${data.length} cards:`);
  data.forEach((card, i) => {
    console.log(`${i+1}. "${card.name}" (problem_type_id: ${card.problem_type_id})`);
  });
}

listCards(); 