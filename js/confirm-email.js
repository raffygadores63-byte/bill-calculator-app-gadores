// Email Confirmation Handler
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Supabase to be initialized
    let attempts = 0;
    while ((typeof supabaseClient === 'undefined' || !supabaseClient) && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        showError('System error: Supabase is not initialized. Please try again.');
        return;
    }

    try {
        // Get the hash from URL (Supabase sends confirmation token in URL hash)
        const hash = window.location.hash;
        
        if (!hash || hash.length < 2) {
            showError('No confirmation token found. The link may be expired or invalid.');
            return;
        }

        // Supabase automatically handles the hash for email confirmation
        // We just need to check if the user session was established
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError) {
            console.error('Session error:', sessionError);
            showError('Error checking confirmation status: ' + sessionError.message);
            return;
        }

        if (session) {
            // Email confirmed successfully - user is now logged in
            console.log('Email confirmed successfully!');
            showSuccess('Your email has been confirmed successfully!', true);
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'user_dashboard.html';
            }, 2000);
        } else {
            // Try to manually verify the token if automatic verification didn't work
            const { error: verifyError } = await supabaseClient.auth.verifyOtp({
                token_hash: hash.substring(1), // Remove '#' from hash
                type: 'email'
            });

            if (verifyError) {
                console.error('Verification error:', verifyError);
                showError('Email confirmation failed: ' + verifyError.message);
            } else {
                // Verification successful
                const { data: { session: newSession } } = await supabaseClient.auth.getSession();
                if (newSession) {
                    showSuccess('Your email has been confirmed successfully!', true);
                    setTimeout(() => {
                        window.location.href = 'user_dashboard.html';
                    }, 2000);
                } else {
                    showSuccess('Email confirmed! Please login to continue.', false);
                }
            }
        }
    } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        showError('An unexpected error occurred: ' + error.message);
    }
});

function showSuccess(message, autoRedirect = false) {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('title').textContent = 'Email Confirmed!';
    document.getElementById('message').textContent = message;
    
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'status-message success';
    statusDiv.innerHTML = '<strong>Success!</strong> Your email has been verified.';
    
    if (!autoRedirect) {
        statusDiv.innerHTML += '<br><a href="login.html" class="btn">Go to Login</a>';
    } else {
        statusDiv.innerHTML += '<br><p style="margin-top: 10px; font-size: 12px;">Redirecting to dashboard...</p>';
    }
}

function showError(message) {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('title').textContent = 'Confirmation Failed';
    document.getElementById('message').textContent = message;
    
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'status-message error';
    statusDiv.innerHTML = '<strong>Error!</strong> ' + message + '<br><a href="register.html" class="btn">Try Again</a> <a href="login.html" class="btn btn-secondary">Go to Login</a>';
}
