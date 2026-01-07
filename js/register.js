// Register Form Validation and Submission
async function handleRegister() {
    // Get form values
    const inputs = document.querySelectorAll('#registerForm input');
    const name = inputs[0]?.value.trim() + ' ' + inputs[1]?.value.trim() || inputs[0]?.value.trim();
    const firstName = inputs[0]?.value.trim();
    const lastName = inputs[1]?.value.trim();
    const email = inputs[2]?.value.trim();
    const password = inputs[3]?.value.trim();
    const confirmPassword = inputs[4]?.value.trim();
    const phone = inputs[5]?.value.trim();

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Register user with Supabase
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                fullname: name,
                first_name: firstName,
                last_name: lastName,
                phone: phone
            }
        }
    });

    if (error) {
        alert('Registration failed: ' + error.message);
        return;
    }

    // If signup successful but not confirmed email, wait for profile creation
    if (data?.user) {
        // Give the database trigger time to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update profile with phone number
        try {
            const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({ phone: phone })
                .eq('id', data.user.id);
            
            if (updateError) {
                console.warn('Warning: Could not save phone number:', updateError);
            }
        } catch (err) {
            console.warn('Warning: Error updating profile:', err);
        }
    }

    alert('Registration successful! Please check your email to confirm your account.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async function() {
    // Redirect if already authenticated
    await redirectIfAuthenticated();

    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleRegister();
        });
    }

    // Social buttons handler
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Social login feature coming soon!');
        });
    });
});
