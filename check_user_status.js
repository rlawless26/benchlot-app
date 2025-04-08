const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserStatus() {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('No authenticated user found');
    return;
  }
  
  console.log();
  
  // Get user profile from the users table
  const { data, error } = await supabase
    .from('users')
    .select('id, username, is_seller, stripe_account_id, stripe_account_status')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return;
  }
  
  console.log('User profile:');
  console.log(JSON.stringify(data, null, 2));
}

checkUserStatus();