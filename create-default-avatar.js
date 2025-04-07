/**
 * Create Default Avatar
 * This script creates a default avatar SVG file in the Supabase storage
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDefaultAvatar() {
  try {
    console.log('Creating default avatar image...');
    
    // Create simple SVG for default avatar
    const defaultAvatarSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#F3F4F6"/>
      <circle cx="100" cy="80" r="40" fill="#9CA3AF"/>
      <path d="M40,160 Q40,100 100,100 Q160,100 160,160" fill="#9CA3AF"/>
    </svg>`;
    
    // Convert SVG string to a Blob
    const svgBlob = new Blob([defaultAvatarSVG], { type: 'image/svg+xml' });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-images')
      .upload('avatars/default-avatar.svg', svgBlob, {
        contentType: 'image/svg+xml',
        upsert: true,
        cacheControl: '604800'
      });
    
    if (error) {
      console.error('Error uploading default avatar:', error);
      return;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-images')
      .getPublicUrl('avatars/default-avatar.svg');
    
    console.log('Default avatar created successfully!');
    console.log('Public URL:', publicUrl);
    
    // Update the database to replace any 'svg' references with the new URL
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, avatar_url')
      .eq('avatar_url', 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/user-images/avatars/svg');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users with the invalid SVG URL`);
    
    // Update each user
    for (const user of users) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError);
      }
    }
    
    console.log(`Updated ${users.length} users with the new default avatar URL`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createDefaultAvatar().catch(console.error);