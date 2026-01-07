// Authentication utility functions

// Check if user is logged in
async function checkAuth() {
    try {
        if (!supabaseClient) {
            console.error('[Auth] Supabase client not initialized');
            return null;
        }
        
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('[Auth] Error checking session:', error);
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('[Auth] Unexpected error:', error);
        return null;
    }
}

// Get current user
async function getCurrentUser() {
    try {
        if (!supabaseClient) {
            console.error('[Auth] Supabase client not initialized');
            return null;
        }
        
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            console.error('[Auth] Error getting user:', error);
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('[Auth] Unexpected error:', error);
        return null;
    }
}

// Check if authenticated and redirect to login if not
async function initAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return session;
}

// Redirect if already authenticated
async function redirectIfAuthenticated() {
    const session = await checkAuth();
    if (session) {
        window.location.href = 'user_dashboard.html';
    }
}

// Sign out
async function signOut() {
    try {
        if (!supabaseClient) {
            console.error('[Auth] Supabase client not initialized');
            return false;
        }
        
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            console.error('[Auth] Error signing out:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('[Auth] Unexpected error:', error);
        return false;
    }
}

// Logout (sign out and redirect)
async function logout() {
    const success = await signOut();
    if (success) {
        window.location.href = 'login.html';
    }
}


