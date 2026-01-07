// Authentication utility functions

// Check if user is logged in
async function checkAuth() {
    try {
        if (typeof supabaseClient === 'undefined') {
            console.error('Supabase client not initialized.');
            return null;
        }
        const {
            data: { session },
            error,
        } = await supabaseClient.auth.getSession();
        if (error) {
            console.error("Error checking auth:", error);
            return null;
        }
        return session;
    } catch (error) {
        console.error('Error checking auth:', error);
        return null;
    }
}

// Get current user information
async function getCurrentUser() {
    try {
        if (typeof supabaseClient === 'undefined') {
            console.error('Supabase client not initialized.');
            return null;
        }
        const {
            data: { user },
            error,
        } = await supabaseClient.auth.getUser();
        if (error) {
            console.error("Error getting user:", error);
            return null;
        }
        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

// Require user to be logged in (redirects if not)
async function requireAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Initialize authentication check (for protected pages)
async function initAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = "login.html";
    }
    return session;
}

// Redirect if already authenticated (for login/register pages)
async function redirectIfAuthenticated() {
    const session = await checkAuth();
    if (session) {
        window.location.href = "user_dashboard.html";
    }
}

// Logout user
async function signOut() {
    try {
        if (typeof supabaseClient === 'undefined') {
            console.error('Supabase client not initialized.');
            return false;
        }
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

// Alias for signOut (for backward compatibility)
async function logout() {
    const success = await signOut();
    if (success) {
        window.location.href = "login.html";
    }
}

