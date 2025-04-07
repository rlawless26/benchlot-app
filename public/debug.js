/**
 * Benchlot Debug Tools
 * 
 * This script adds debug functions to the window object to help diagnose issues
 * in the browser console.
 */

window.benchlotDebug = {
  // Test if an image URL is accessible
  testImageUrl: function(url) {
    console.log(`Testing image URL: ${url}`);
    
    if (!url) {
      console.error('No URL provided');
      return false;
    }
    
    // For blob URLs, just check if they're valid
    if (url.startsWith('blob:')) {
      console.log('This is a blob URL - checking if it exists...');
      try {
        fetch(url)
          .then(response => {
            if (response.ok) {
              console.log('✅ Blob URL is valid');
            } else {
              console.error('❌ Blob URL is invalid -', response.status, response.statusText);
            }
          })
          .catch(err => {
            console.error('❌ Error accessing blob URL:', err);
          });
      } catch (err) {
        console.error('❌ Error testing blob URL:', err);
      }
      return;
    }
    
    // For regular URLs, test with an image element
    const img = new Image();
    img.onload = function() {
      console.log('✅ Image URL is accessible!', { 
        width: img.width, 
        height: img.height, 
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    };
    
    img.onerror = function() {
      console.error('❌ Image URL is NOT accessible!');
      
      // If it's a Supabase URL, try to fix it
      if (url.includes('supabase')) {
        const fixedUrl = this.fixSupabaseUrl(url);
        console.log(`Try this fixed URL instead: ${fixedUrl}`);
      }
    };
    
    // Add a cache buster to avoid cached results
    const cacheBuster = Date.now();
    img.src = url.includes('?') ? 
      `${url}&_cb=${cacheBuster}` : 
      `${url}?_cb=${cacheBuster}`;
  },
  
  // Fix common Supabase URL issues
  fixSupabaseUrl: function(url) {
    if (!url) return '';
    
    try {
      // Parse the URL
      const urlObj = new URL(url);
      
      // 1. Fix signed URLs
      if (urlObj.pathname.includes('/object/sign/')) {
        urlObj.pathname = urlObj.pathname.replace('/object/sign/', '/object/public/');
        
        // Remove token parameter
        urlObj.searchParams.delete('token');
      }
      
      // 2. Fix duplicate cache parameters
      urlObj.searchParams.delete('t');
      urlObj.searchParams.delete('cb');
      
      // 3. Add a fresh cache parameter
      urlObj.searchParams.set('cb', Date.now().toString());
      
      return urlObj.toString();
    } catch (e) {
      console.error('Error fixing URL:', e);
      
      // Basic string replacement fallback
      if (url.includes('/object/sign/')) {
        return url.replace('/object/sign/', '/object/public/').split('?')[0] + '?cb=' + Date.now();
      }
      
      return url;
    }
  },
  
  // Check environment variables
  checkEnv: function() {
    console.log('Environment Variables:');
    console.log('- BENCHLOT_CORE_CONFIG:', window.__BENCHLOT_CORE_CONFIG ? '✓ Available' : '✗ Missing');
    console.log('- BENCHLOT_ENV:', window.BENCHLOT_ENV ? '✓ Available' : '✗ Missing');
    console.log('- React App Vars:', {
      SUPABASE_URL: window.REACT_APP_SUPABASE_URL ? '✓ Available' : '✗ Missing',
      SUPABASE_ANON_KEY: window.REACT_APP_SUPABASE_ANON_KEY ? '✓ Available' : '✗ Missing',
      API_URL: window.REACT_APP_API_URL ? '✓ Available' : '✗ Missing'
    });
    
    return {
      BENCHLOT_CORE_CONFIG: window.__BENCHLOT_CORE_CONFIG,
      BENCHLOT_ENV: window.BENCHLOT_ENV,
      REACT_APP: {
        SUPABASE_URL: window.REACT_APP_SUPABASE_URL,
        SUPABASE_ANON_KEY: window.REACT_APP_SUPABASE_ANON_KEY ? '[REDACTED]' : undefined,
        API_URL: window.REACT_APP_API_URL
      }
    };
  }
};

console.log('✅ Benchlot Debug Tools loaded. Use window.benchlotDebug in the console.');
console.log('Available commands:');
console.log('- window.benchlotDebug.testImageUrl(url) - Test if an image URL is accessible');
console.log('- window.benchlotDebug.fixSupabaseUrl(url) - Fix common Supabase URL issues');
console.log('- window.benchlotDebug.checkEnv() - Check environment variables');