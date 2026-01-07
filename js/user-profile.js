// Load user data on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication on page load
    const session = await initAuth();
    if (!session) return; // User was redirected to login

    const user = await getCurrentUser();
    if (!user) return;

    // Load user data from Supabase auth metadata
    const userMetadata = user.user_metadata || {};
    const fullName = userMetadata.full_name || (userMetadata.first_name + ' ' + (userMetadata.last_name || ''));
    const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || 'User';
    const lastName = userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
    const email = user.email || '';
    const phone = userMetadata.phone || '';

    // Update profile display
    const infoValues = document.querySelectorAll('.info-value');
    if (infoValues.length >= 3) {
        infoValues[0].textContent = fullName || (firstName + ' ' + lastName);
        infoValues[1].textContent = email;
        infoValues[2].textContent = phone;
    }

    // Update account details
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const detailValues = document.querySelectorAll('.detail-value');
    if (detailValues.length >= 1) {
        detailValues[0].textContent = memberSince;
    }
});

// Update Profile Info
document.addEventListener('DOMContentLoaded', async function() {
    const updateBtn = document.querySelector('.update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', async function() {
            alert('Profile update feature coming soon! For now, you can update your profile through Supabase dashboard.');
        });
    }
});

// Edit Avatar
document.addEventListener('DOMContentLoaded', function() {
    const avatarEdit = document.querySelector('.avatar-edit');
    if (avatarEdit) {
        avatarEdit.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    alert('Avatar updated! (In a real app, this would upload the image to Supabase Storage)');
                }
            });
            input.click();
        });
    }
});

// Change Password Form
document.addEventListener('DOMContentLoaded', async function() {
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const inputs = document.querySelectorAll('.update-password-section input');
            const currentPassword = inputs[0].value;
            const newPassword = inputs[1].value;
            const confirmPassword = inputs[2].value;

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields');
                return;
            }

            if (newPassword.length < 6) {
                alert('New password must be at least 6 characters');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Show loading state
            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Updating...';
            submitBtn.disabled = true;

            try {
                // Update password in Supabase
                const { error } = await supabaseClient.auth.updateUser({
                    password: newPassword
                });

                if (error) throw error;

                alert('Password changed successfully!');
                passwordForm.reset();
            } catch (error) {
                console.error('Error updating password:', error);
                alert(error.message || 'Failed to update password. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
