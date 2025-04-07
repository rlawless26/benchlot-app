/**
 * Benchlot Debug Utility
 * This script provides diagnostic information for troubleshooting browser compatibility issues,
 * particularly in Safari.
 */

(function() {
  console.log('🔍 Benchlot Debug Utility Loaded');
  
  // Create global diagnostic object
  window.__BENCHLOT_DIAGNOSTICS = {
    browserInfo: {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled
    },
    localStorage: {
      available: false,
      items: {}
    },
    sessionStorage: {
      available: false,
      items: {}
    },
    supabaseStatus: {
      initialized: false,
      lastRequest: null,
      errors: []
    },
    logs: []
  };
  
  // Test localStorage availability and report content
  try {
    if (window.localStorage) {
      window.__BENCHLOT_DIAGNOSTICS.localStorage.available = true;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.startsWith('cart') || key.includes('session') || key.includes('tools')) {
          window.__BENCHLOT_DIAGNOSTICS.localStorage.items[key] = `[${typeof localStorage[key]}:${localStorage[key].length} chars]`;
        }
      });
    }
  } catch (e) {
    window.__BENCHLOT_DIAGNOSTICS.localStorage.error = e.message;
  }
  
  // Test sessionStorage availability
  try {
    if (window.sessionStorage) {
      window.__BENCHLOT_DIAGNOSTICS.sessionStorage.available = true;
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.includes('session')) {
          window.__BENCHLOT_DIAGNOSTICS.sessionStorage.items[key] = `[${typeof sessionStorage[key]}:${sessionStorage[key].length} chars]`;
        }
      });
    }
  } catch (e) {
    window.__BENCHLOT_DIAGNOSTICS.sessionStorage.error = e.message;
  }
  
  // Add logging capabilities
  const originalConsoleLog = console.log;
  console.log = function() {
    const args = Array.from(arguments);
    originalConsoleLog.apply(console, args);
    
    // Only log Supabase-related entries and errors
    const logStr = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    if (logStr.includes('supabase') || logStr.includes('error') || logStr.includes('Supabase')) {
      window.__BENCHLOT_DIAGNOSTICS.logs.push({
        timestamp: new Date().toISOString(),
        log: logStr
      });
    }
  };
  
  // Intercept fetch requests to detect and log Supabase API calls
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Check if this is a Supabase request
    if (typeof url === 'string' && url.includes('supabase')) {
      window.__BENCHLOT_DIAGNOSTICS.supabaseStatus.lastRequest = {
        url: url,
        method: options?.method || 'GET',
        timestamp: new Date().toISOString()
      };
      
      console.log('🔌 Supabase API request:', url);
      
      // Return the fetch with an error handler
      return originalFetch.apply(this, arguments)
        .then(response => {
          if (!response.ok) {
            const error = `Supabase API error: ${response.status} ${response.statusText}`;
            console.error(error);
            window.__BENCHLOT_DIAGNOSTICS.supabaseStatus.errors.push({
              timestamp: new Date().toISOString(),
              error,
              url,
              status: response.status
            });
          }
          return response;
        })
        .catch(error => {
          console.error('Supabase fetch error:', error);
          window.__BENCHLOT_DIAGNOSTICS.supabaseStatus.errors.push({
            timestamp: new Date().toISOString(),
            error: error.message,
            url,
            type: 'network'
          });
          throw error;
        });
    }
    
    // Not a Supabase request, proceed normally
    return originalFetch.apply(this, arguments);
  };
  
  // Function to show diagnostics on demand
  window.showBenchlotDiagnostics = function() {
    console.log('📊 BENCHLOT DIAGNOSTICS:', window.__BENCHLOT_DIAGNOSTICS);
    
    // Create a visual display for easy viewing
    const diagEl = document.createElement('div');
    diagEl.style.position = 'fixed';
    diagEl.style.top = '0';
    diagEl.style.left = '0';
    diagEl.style.width = '100%';
    diagEl.style.height = '100%';
    diagEl.style.backgroundColor = 'rgba(0,0,0,0.9)';
    diagEl.style.color = 'white';
    diagEl.style.padding = '20px';
    diagEl.style.fontFamily = 'monospace';
    diagEl.style.fontSize = '12px';
    diagEl.style.zIndex = '99999';
    diagEl.style.overflow = 'auto';
    
    const diag = window.__BENCHLOT_DIAGNOSTICS;
    
    diagEl.innerHTML = `
      <h1 style="color: white; margin-bottom: 20px;">Benchlot Diagnostics</h1>
      <button id="close-diagnostics" style="position: absolute; top: 10px; right: 10px; padding: 5px 10px; background: #333; color: white; border: none;">Close</button>
      
      <h2 style="color: #55aaff;">Browser Information</h2>
      <pre>${JSON.stringify(diag.browserInfo, null, 2)}</pre>
      
      <h2 style="color: #55aaff;">LocalStorage</h2>
      <pre>${JSON.stringify(diag.localStorage, null, 2)}</pre>
      
      <h2 style="color: #55aaff;">SessionStorage</h2>
      <pre>${JSON.stringify(diag.sessionStorage, null, 2)}</pre>
      
      <h2 style="color: #55aaff;">Supabase Status</h2>
      <pre>${JSON.stringify(diag.supabaseStatus, null, 2)}</pre>
      
      <h2 style="color: #55aaff;">Last 10 Logs</h2>
      <pre>${JSON.stringify(diag.logs.slice(-10), null, 2)}</pre>
      
      <h2 style="color: #55aaff;">Environment</h2>
      <pre>${JSON.stringify({
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          location: window.location.href
        },
        config: {
          BENCHLOT_ENV: window.BENCHLOT_ENV ? 'Present' : 'Missing',
          REACT_APP_VARS: Object.keys(window).filter(k => k.startsWith('REACT_APP_')).length,
          __BENCHLOT_CORE_CONFIG: window.__BENCHLOT_CORE_CONFIG ? 'Present' : 'Missing'
        }
      }, null, 2)}</pre>
    `;
    
    document.body.appendChild(diagEl);
    
    document.getElementById('close-diagnostics').addEventListener('click', function() {
      document.body.removeChild(diagEl);
    });
  };
  
  // Register diagnostic key command (Alt+Shift+D)
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.shiftKey && e.key === 'D') {
      window.showBenchlotDiagnostics();
    }
  });
  
  console.log('✅ Benchlot Debug Utility ready! Press Alt+Shift+D to show diagnostics');
})();