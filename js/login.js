// Login Form Validation and Submission
async function handleLogin() {
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
        alert('Login failed: ' + error.message);
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
