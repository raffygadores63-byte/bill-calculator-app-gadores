// Login Form Validation and Submission
async function handleLogin() {
    console.log('handleLogin called');
    
    // Check if Supabase client is initialized
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('System error: Supabase is not initialized. Please refresh the page and try again.');
        console.error('Supabase client not initialized');
        return;
    }

    // Get form values using the form element
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        alert('Form not found. Please refresh the page.');
        console.error('Login form not found');
        return;
    }
    
    const email = loginForm.querySelector('input[type="email"]')?.value?.trim();
    const password = loginForm.querySelector('input[type="password"]')?.value?.trim();

    console.log('Email:', email ? 'provided' : 'missing');
    console.log('Password:', password ? 'provided' : 'missing');

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        console.log('Attempting login with email:', email);
        
        // Sign in with Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Login error:', error);
            let errorMessage = error.message || 'Unknown error occurred';
            if (errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Connection error. Please check your internet connection and try again.';
            }
            alert('Login failed: ' + errorMessage);
            return;
        }

        console.log('Login successful, redirecting to dashboard');
        // Success - redirect to dashboard
        window.location.href = 'user_dashboard.html';
    } catch (error) {
        console.error('Unexpected error during login:', error);
        alert('An unexpected error occurred: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Login page loaded');
    
    // Redirect if already authenticated
    await redirectIfAuthenticated();

    const loginForm = document.getElementById('loginForm');
    console.log('Login form found:', !!loginForm);
    
    if (loginForm) {
        console.log('Attaching submit event listener to login form');
        loginForm.addEventListener('submit', async function(e) {
            console.log('Login form submitted');
            e.preventDefault();
            await handleLogin();
        });
    } else {
        console.error('Login form not found! Check if the form ID is correct.');
    }

    // Forgot Password Link
    document.querySelectorAll('a').forEach(link => {
        if (link.textContent.includes('Forgot')) {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                const email = prompt('Enter your email address to reset password:');
                if (email) {
                    try {
                        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                            redirectTo: `${getSiteUrl()}/login.html`
                        });
                        if (error) throw error;
                        alert('Password reset link has been sent to your email');
                    } catch (error) {
                        console.error('Password reset error:', error);
                        alert(error.message || 'Failed to send password reset email');
                    }
                }
            });
        }
    });
});
