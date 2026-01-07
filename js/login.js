// Login Form Validation and Submission
async function handleLogin() {
    // Check if Supabase client is initialized
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('System error: Supabase is not initialized. Please refresh the page and try again.');
        console.error('Supabase client not initialized');
        return;
    }

    const email = document.getElementById('email')?.value || document.querySelector('input[type="email"]')?.value;
    const password = document.getElementById('password')?.value || document.querySelector('input[type="password"]')?.value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

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

    // Success - redirect to dashboard
    window.location.href = 'user_dashboard.html';
}

document.addEventListener('DOMContentLoaded', async function() {
    // Redirect if already authenticated
    await redirectIfAuthenticated();

    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin();
        });
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
                            redirectTo: window.location.origin + '/login.html'
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
