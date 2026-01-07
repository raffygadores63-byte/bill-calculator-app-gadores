// Supabase Configuration
const supabaseUrl = "https://syyqaofecnsxxucsmftc.supabase.co";
const supabaseKey = "sb_publishable_UgL-yfOe5xmIco_yx9p-KQ_cU-8rBsh";

// Get the site URL (works for both localhost and production)
const getSiteUrl = () => {
    const url = window.location.origin;
    return url;
};

// Create Supabase client (supabase is available globally from CDN)
// The CDN script exposes supabase with createClient method
let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
            supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
            window.supabaseClient = supabaseClient;
            console.log('[Supabase] Client initialized successfully');
            return true;
        } catch (error) {
            console.error('[Supabase] Error initializing client:', error);
            return false;
        }
    } else {
        console.error('[Supabase] Library not loaded yet');
        return false;
    }
}

// Wait for the library to load, then initialize
(function() {
    // Try multiple times to initialize
    let attempts = 0;
    const maxAttempts = 30; // 1.5 seconds total (30 * 50ms)
    
    const attemptInit = () => {
        if (initSupabase()) {
            console.log('[Supabase] Initialization successful');
            return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
            setTimeout(attemptInit, 50);
        } else {
            console.error('[Supabase] Failed to initialize after ' + maxAttempts + ' attempts');
        }
    };
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInit);
    } else {
        attemptInit();
    }
})();


