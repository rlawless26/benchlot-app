/**
 * Tool Image URL Fixer
 * This script fixes tool image URLs in the database by converting signed URLs to public URLs
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with SERVICE ROLE KEY
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://tavhowcenicgowmdmbcz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Fix a Supabase URL by converting from signed to public URL
 */
function fixUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // If it's a signed URL, convert to public
    if (url.includes('/object/sign/')) {
      // Replace /object/sign/ with /object/public/ and remove token parameter
      const baseUrl = url.replace('/object/sign/', '/object/public/').split('?')[0];
      return baseUrl;
    }
    
    // If it already contains query params, remove them to clean up
    if (url.includes('?')) {
      return url.split('?')[0];
    }
    
    return url;
  } catch (e) {
    console.error('Error fixing URL:', e);
    return url;
  }
}

/**
 * Fix all tool image URLs in the database
 */
async function fixAllToolUrls() {
  try {
    console.log('Starting tool image URL fix process...');
    
    // Get all tools with images
    const { data: tools, error } = await supabaseAdmin
      .from('tools')
      .select('id, images')
      .not('images', 'is', null);
      
    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }
    
    console.log(`Found ${tools.length} tools with images`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let problemCount = 0;
    
    // Process each tool
    for (const tool of tools) {
      console.log(`\nProcessing tool: ${tool.id}`);
      
      if (!tool.images || !Array.isArray(tool.images) || tool.images.length === 0) {
        console.log('No images to fix, skipping');
        continue;
      }
      
      // Check if any images need fixing
      const hasSignedUrls = tool.images.some(img => 
        typeof img === 'string' && img.includes('/object/sign/')
      );
      
      if (!hasSignedUrls) {
        console.log('No signed URLs found, skipping');
        alreadyCorrectCount++;
        continue;
      }
      
      // Fix each image URL
      const fixedImages = tool.images.map(img => fixUrl(img));
      
      console.log('Original images:', tool.images);
      console.log('Fixed images:', fixedImages);
      
      // Update the tool
      const { error: updateError } = await supabaseAdmin
        .from('tools')
        .update({ images: fixedImages })
        .eq('id', tool.id);
        
      if (updateError) {
        console.error('Error updating tool:', updateError);
        problemCount++;
        continue;
      }
      
      console.log('Tool image URLs fixed successfully');
      fixedCount++;
    }
    
    console.log('\nSummary:');
    console.log(`Total tools processed: ${tools.length}`);
    console.log(`Already correct: ${alreadyCorrectCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Problems: ${problemCount}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Fix a specific tool's image URLs
 */
async function fixSpecificToolUrl(toolId) {
  try {
    console.log(`Fixing image URLs for tool ${toolId}...`);
    
    // Get the tool
    const { data: tool, error } = await supabaseAdmin
      .from('tools')
      .select('id, images')
      .eq('id', toolId)
      .single();
      
    if (error) {
      console.error('Error fetching tool:', error);
      return;
    }
    
    if (!tool || !tool.images || !Array.isArray(tool.images)) {
      console.log('No images to fix');
      return;
    }
    
    console.log('Original images:', tool.images);
    
    // Fix each image URL
    const fixedImages = tool.images.map(img => fixUrl(img));
    
    console.log('Fixed images:', fixedImages);
    
    // Update the tool
    const { error: updateError } = await supabaseAdmin
      .from('tools')
      .update({ images: fixedImages })
      .eq('id', tool.id);
      
    if (updateError) {
      console.error('Error updating tool:', updateError);
      return;
    }
    
    console.log('Tool image URLs fixed successfully');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  // If a tool ID is provided, fix just that tool
  fixSpecificToolUrl(args[0]);
} else {
  // Otherwise fix all tools
  fixAllToolUrls();
}