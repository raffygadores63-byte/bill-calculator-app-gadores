// Login Form Validation and Submission
let loginInProgress = false; // Prevent multiple submissions

async function handleLogin() {
    console.log('=== handleLogin called ===');
    
    // Prevent multiple simultaneous login attempts
    if (loginInProgress) {
        console.log('Login already in progress');
        return;
    }
    
    // Check if Supabase client is initialized
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error('Supabase client not initialized');
        alert('System error: Supabase not ready. Please refresh the page.');
        return;
    }

    // Get form and inputs
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        alert('Form error. Please refresh.');
        return;
    }
    
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    
    const email = emailInput?.value?.trim() || '';
    const password = passwordInput?.value?.trim() || '';

    console.log('Email:', email ? 'provided' : 'missing');
    console.log('Password:', password ? 'provided' : 'missing');

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        loginInProgress = true;
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Logging in...';
        }
        
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
                errorMessage = 'Connection error. Check your internet.';
            } else if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password.';
            }
            
            alert('Login failed: ' + errorMessage);
            
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login Now';
            }
            loginInProgress = false;
            return;
        }

        if (!data?.session) {
            console.error('No session in login response');
            alert('Login error: No session created');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login Now';
            }
            loginInProgress = false;
            return;
        }

        console.log('Login successful!');
        console.log('Redirecting to user_dashboard.html');
        
        // Wait a bit then redirect
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = 'user_dashboard.html';
        
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('Error: ' + error.message);
        
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login Now';
        }
        loginInProgress = false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== Page loaded ===');
    
    // Wait for Supabase to be ready
    let attempts = 0;
    while ((typeof supabaseClient === 'undefined' || !supabaseClient) && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
    }
    
    console.log('Supabase ready:', !!supabaseClient);
    
    // Check if already logged in
    await redirectIfAuthenticated();

    // Get form
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Form not found');
        return;
    }
    
    console.log('Setting up form handlers');
    
    // Form submit handler
    loginForm.addEventListener('submit', function(e) {
        console.log('Form submitted');
        e.preventDefault();
        handleLogin();
    });
    
    // Button click handler
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            console.log('Button clicked');
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
        });
    }

    // Password reset
    const forgotLink = document.querySelector('a[href*="password"], a[href*="forgot"]');
    if (forgotLink) {
        forgotLink.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = prompt('Enter your email:');
            if (email) {
                try {
                    await supabaseClient.auth.resetPasswordForEmail(email, {
                        redirectTo: `${getSiteUrl()}/login.html`
                    });
                    alert('Password reset link sent to your email');
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
        });
    }
});

