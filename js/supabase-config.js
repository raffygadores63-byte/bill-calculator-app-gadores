// Supabase Configuration
const supabaseUrl = "https://syyqaofecnsxxucsmftc.supabase.co";
const supabaseKey = "sb_publishable_UgL-yfOe5xmIco_yx9p-KQ_cU-8rBsh";

// Get the site URL (works for both localhost and production)
const getSiteUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://${window.location.host}`;
    }
    return `${window.location.protocol}//${window.location.host}`;
};

// Create Supabase client (supabase is available globally from CDN)
// The CDN script exposes supabase with createClient method
let supabaseClient;

// Wait for the library to load, then initialize
(function() {
    function initClient() {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            try {
                const { createClient } = supabase;
                supabaseClient = createClient(supabaseUrl, supabaseKey);
                window.supabaseClient = supabaseClient;
                console.log('Supabase client initialized successfully');
            } catch (error) {
                console.error('Error initializing Supabase client:', error);
            }
        } else {
            console.error('Supabase library not loaded. Make sure the CDN script is included before this file.');
        }
    }
    
    // Wait for script to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initClient, 100);
        });
    } else {
        setTimeout(initClient, 100);
    }
    
    // Also try to initialize immediately if library is already loaded
    setTimeout(initClient, 50);
})();

